import request from '@/utils/request'

// 初始化文件上传
export function initFileUpload(data) {
  return request({
    url: '/files/init',
    method: 'post',
    data
  })
}

// 上传文件分片
export function uploadFileChunk(data) {
  return request({
    url: '/files/chunk',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 合并文件分片
export function mergeFileChunks(data) {
  return request({
    url: '/files/merge',
    method: 'post',
    data
  })
}

// 创建转换任务
export function createConvertTask(data) {
  return request({
    url: '/convert/task',
    method: 'post',
    data
  })
}

// 获取转换进度
export function getConvertProgress(taskId) {
  return request({
    url: `/convert/progress/${taskId}`,
    method: 'get'
  })
}

// 获取转换结果
export function getConversionResult(fileId) {
  return request({
    url: `/file/conversion/${fileId}`,
    method: 'get'
  })
}

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/file/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 