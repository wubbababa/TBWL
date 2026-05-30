/**
 * 面单（Waybill）上传/下载工具库。
 *
 * 面单文件保存在 Supabase Storage 的私有 bucket `waybills` 中，
 * orders 表通过 waybill_path / waybill_filename / waybill_uploaded_at
 * 三个字段记录关联关系。
 *
 * 由于 bucket 为私有，下载/预览统一通过临时签名 URL（signed URL）完成。
 */

import { supabase } from '@/lib/supabase';

/** 面单存放的 Storage bucket 名称。 */
export const WAYBILL_BUCKET = 'waybills';

/** 允许上传的面单文件类型（扩展名，小写，含点）。 */
export const ALLOWED_WAYBILL_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'] as const;

/** 单个面单文件大小上限（10 MB）。 */
export const MAX_WAYBILL_SIZE = 10 * 1024 * 1024;

/** 订单中与面单相关的字段子集。 */
export interface OrderWaybillFields {
  id: string | number;
  order_number: string;
  waybill_path?: string | null;
  waybill_filename?: string | null;
  waybill_uploaded_at?: string | null;
}

/** 取文件扩展名（小写，含点）。无扩展名返回空串。 */
export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

/** 校验文件类型与大小，返回错误信息；通过则返回 null。 */
export function validateWaybillFile(file: File): string | null {
  const ext = getExtension(file.name);
  if (!ALLOWED_WAYBILL_EXTENSIONS.includes(ext as (typeof ALLOWED_WAYBILL_EXTENSIONS)[number])) {
    return `不支持的文件类型「${ext || '未知'}」，仅支持 ${ALLOWED_WAYBILL_EXTENSIONS.join('、')}`;
  }
  if (file.size > MAX_WAYBILL_SIZE) {
    return `文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），上限为 ${MAX_WAYBILL_SIZE / 1024 / 1024}MB`;
  }
  return null;
}

/** 生成 bucket 内的对象存放路径：orders/{orderId}/{时间戳}{扩展名}。 */
function buildObjectPath(orderId: string | number, filename: string): string {
  const ext = getExtension(filename);
  return `orders/${orderId}/${Date.now()}${ext}`;
}

/**
 * 上传单个订单的面单文件，并写回 orders 表的面单字段。
 * 若订单已有旧面单，会在写入新记录后删除旧的 Storage 对象。
 */
export async function uploadWaybill(
  order: OrderWaybillFields,
  file: File,
): Promise<void> {
  const validationError = validateWaybillFile(file);
  if (validationError) throw new Error(validationError);

  const oldPath = order.waybill_path ?? null;
  const objectPath = buildObjectPath(order.id, file.name);

  // 1. 上传到 Storage
  const { error: uploadError } = await supabase.storage
    .from(WAYBILL_BUCKET)
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
  if (uploadError) throw uploadError;

  // 2. 更新 orders 表记录
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      waybill_path: objectPath,
      waybill_filename: file.name,
      waybill_uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (updateError) {
    // 回滚：删除刚上传的对象，避免产生孤儿文件
    await supabase.storage.from(WAYBILL_BUCKET).remove([objectPath]);
    throw updateError;
  }

  // 3. 删除旧面单对象（失败不阻塞主流程）
  if (oldPath && oldPath !== objectPath) {
    await supabase.storage.from(WAYBILL_BUCKET).remove([oldPath]).catch(() => {});
  }
}

/**
 * 为指定面单对象生成临时签名 URL（默认 5 分钟有效）。
 * @param download 为 true 时携带原始文件名触发浏览器下载。
 */
export async function getWaybillSignedUrl(
  path: string,
  options?: { expiresIn?: number; downloadName?: string },
): Promise<string> {
  const expiresIn = options?.expiresIn ?? 300;
  const { data, error } = await supabase.storage
    .from(WAYBILL_BUCKET)
    .createSignedUrl(
      path,
      expiresIn,
      options?.downloadName ? { download: options.downloadName } : undefined,
    );
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('无法生成面单访问链接');
  return data.signedUrl;
}

/** 通过签名 URL 在浏览器中触发下载单个面单。 */
export async function downloadWaybill(order: OrderWaybillFields): Promise<void> {
  if (!order.waybill_path) throw new Error('该订单暂无面单');
  const downloadName =
    order.waybill_filename ||
    `${order.order_number}${getExtension(order.waybill_path)}`;
  const url = await getWaybillSignedUrl(order.waybill_path, { downloadName });

  const a = document.createElement('a');
  a.href = url;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** 面单文件的可预览类型。 */
export type WaybillKind = 'image' | 'pdf' | 'other';

/** 根据扩展名判断面单的预览类型。 */
export function getWaybillKind(filenameOrPath?: string | null): WaybillKind {
  if (!filenameOrPath) return 'other';
  const ext = getExtension(filenameOrPath);
  if (ext === '.pdf') return 'pdf';
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return 'image';
  return 'other';
}

/** 在新标签页预览面单（不触发下载）。 */
export async function previewWaybill(order: OrderWaybillFields): Promise<void> {
  if (!order.waybill_path) throw new Error('该订单暂无面单');
  const url = await getWaybillSignedUrl(order.waybill_path);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** 删除订单的面单（同时清理 Storage 对象与表字段）。 */
export async function removeWaybill(order: OrderWaybillFields): Promise<void> {
  if (!order.waybill_path) return;

  const { error: removeError } = await supabase.storage
    .from(WAYBILL_BUCKET)
    .remove([order.waybill_path]);
  if (removeError) throw removeError;

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      waybill_path: null,
      waybill_filename: null,
      waybill_uploaded_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);
  if (updateError) throw updateError;
}

/**
 * 批量下载多个订单的面单：逐个生成签名 URL 并触发下载。
 * 返回已成功触发下载的数量与跳过（无面单）的订单号列表。
 */
export async function downloadWaybillsBatch(
  orders: OrderWaybillFields[],
): Promise<{ downloaded: number; skipped: string[] }> {
  let downloaded = 0;
  const skipped: string[] = [];

  for (const order of orders) {
    if (!order.waybill_path) {
      skipped.push(order.order_number);
      continue;
    }
    await downloadWaybill(order);
    downloaded++;
    // 多个下载之间稍作间隔，避免浏览器拦截连续下载
    await new Promise((r) => setTimeout(r, 350));
  }

  return { downloaded, skipped };
}
