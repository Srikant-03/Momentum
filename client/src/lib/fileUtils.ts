/**
 * File utility functions for working with file types
 */

import React from 'react';
import { FileText, Image, FileAudio, FileVideo, File } from 'lucide-react';

/**
 * Check if a file is an image based on extension or MIME type
 * @param filename File name or URL to check
 * @returns Boolean indicating if the file is an image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const lowerFilename = filename.toLowerCase();
  
  return imageExtensions.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Check if a file is a document based on extension
 * @param filename File name or URL to check
 * @returns Boolean indicating if the file is a document
 */
export function isDocumentFile(filename: string): boolean {
  const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
  const lowerFilename = filename.toLowerCase();
  
  return documentExtensions.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Check if a file is an audio file based on extension
 * @param filename File name or URL to check
 * @returns Boolean indicating if the file is an audio file
 */
export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
  const lowerFilename = filename.toLowerCase();
  
  return audioExtensions.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Check if a file is a video file based on extension
 * @param filename File name or URL to check
 * @returns Boolean indicating if the file is a video file
 */
export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv'];
  const lowerFilename = filename.toLowerCase();
  
  return videoExtensions.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Get an appropriate icon component for a file based on its type
 * @param filename File name or URL
 * @returns React component to use as icon
 */
export function getFileIcon(filename: string): JSX.Element {
  if (isImageFile(filename)) {
    return React.createElement(Image, { className: "h-8 w-8" });
  } else if (isDocumentFile(filename)) {
    return React.createElement(FileText, { className: "h-8 w-8" });
  } else if (isAudioFile(filename)) {
    return React.createElement(FileAudio, { className: "h-8 w-8" });
  } else if (isVideoFile(filename)) {
    return React.createElement(FileVideo, { className: "h-8 w-8" });
  } else {
    return React.createElement(File, { className: "h-8 w-8" });
  }
}

/**
 * Format file size in bytes to a human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extract file extension from a filename
 * @param filename File name
 * @returns File extension without the dot
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Extract filename from a path
 * @param path File path or URL
 * @returns Filename without the path
 */
export function getFilename(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

/**
 * Convert a data URL to a Blob object
 * @param dataUrl Data URL string
 * @returns Blob object
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}