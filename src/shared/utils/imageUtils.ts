/**
 * 🖼️ Image Utilities
 * 
 * Utility functions for image handling, validation, and optimization.
 * Handles image resizing, format validation, and URL management.
 */

/**
 * 📐 Image Dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * 📊 Image Info
 */
export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  size: number;
  type: string;
  name?: string;
}

/**
 * 🔧 Image Resize Options
 */
export interface ResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
  maintainAspectRatio?: boolean;
}

/**
 * ✅ Validate image file
 */
export const validateImage = (
  imageInfo: Partial<ImageInfo>,
  options?: {
    maxSize?: number; // in bytes
    maxWidth?: number;
    maxHeight?: number;
    allowedFormats?: string[];
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = {
    maxSize: 10 * 1024 * 1024, // 10MB default
    maxWidth: 2048,
    maxHeight: 2048,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    ...options,
  };
  
  // Check if image exists
  if (!imageInfo.uri) {
    errors.push('Imagem é obrigatória');
    return { isValid: false, errors };
  }
  
  // Check file size
  if (imageInfo.size && imageInfo.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`Imagem muito grande. Máximo ${maxSizeMB}MB`);
  }
  
  // Check dimensions
  if (imageInfo.width && imageInfo.width > config.maxWidth) {
    errors.push(`Largura muito grande. Máximo ${config.maxWidth}px`);
  }
  
  if (imageInfo.height && imageInfo.height > config.maxHeight) {
    errors.push(`Altura muito grande. Máximo ${config.maxHeight}px`);
  }
  
  // Check format
  if (imageInfo.type) {
    const format = imageInfo.type.toLowerCase().replace('image/', '');
    if (!config.allowedFormats.includes(format)) {
      errors.push(`Formato não suportado. Use: ${config.allowedFormats.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 📏 Calculate aspect ratio
 */
export const calculateAspectRatio = (width: number, height: number): number => {
  if (!width || !height || width <= 0 || height <= 0) {
    return 1;
  }
  
  return width / height;
};

/**
 * 📐 Calculate dimensions maintaining aspect ratio
 */
export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): ImageDimensions => {
  if (!originalWidth || !originalHeight || originalWidth <= 0 || originalHeight <= 0) {
    return { width: 300, height: 200 }; // Default dimensions
  }
  
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);
  
  // If both dimensions provided, use them as-is
  if (targetWidth && targetHeight) {
    return { width: targetWidth, height: targetHeight };
  }
  
  // If only width provided, calculate height
  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  }
  
  // If only height provided, calculate width
  if (targetHeight && !targetWidth) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  }
  
  // If no target dimensions, return original
  return { width: originalWidth, height: originalHeight };
};

/**
 * 🎨 Generate placeholder image URL
 */
export const generatePlaceholder = (
  width: number = 400,
  height: number = 300,
  backgroundColor: string = 'FFC107',
  textColor: string = 'FFFFFF',
  text: string = 'Recipe'
): string => {
  return `https://via.placeholder.com/${width}x${height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

/**
 * 🖼️ Get image dimensions from URL (for web)
 */
export const getImageDimensions = (url: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Image) {
      const img = new window.Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    } else {
      // For React Native, this would be handled differently
      reject(new Error('Not supported in this environment'));
    }
  });
};

/**
 * 🔗 Build optimized image URL
 */
export const buildImageUrl = (
  baseUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    fit?: 'cover' | 'contain' | 'fill';
  }
): string => {
  if (!baseUrl) {
    return generatePlaceholder();
  }
  
  // If it's already a full URL, return as-is
  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }
  
  // Build query parameters for image optimization service
  const params = new URLSearchParams();
  
  if (options?.width) {
    params.append('w', options.width.toString());
  }
  
  if (options?.height) {
    params.append('h', options.height.toString());
  }
  
  if (options?.quality) {
    params.append('q', options.quality.toString());
  }
  
  if (options?.format) {
    params.append('f', options.format);
  }
  
  if (options?.fit) {
    params.append('fit', options.fit);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * 📱 Generate responsive image URLs
 */
export const generateResponsiveImages = (
  baseUrl: string,
  breakpoints: number[] = [320, 480, 768, 1024, 1200]
): { [key: string]: string } => {
  const images: { [key: string]: string } = {};
  
  breakpoints.forEach(width => {
    images[`${width}w`] = buildImageUrl(baseUrl, { width, quality: 80 });
  });
  
  return images;
};

/**
 * 🎯 Get optimal image size for context
 */
export const getOptimalImageSize = (
  context: 'thumbnail' | 'card' | 'detail' | 'hero' | 'avatar'
): { width: number; height: number; quality: number } => {
  const sizes = {
    thumbnail: { width: 100, height: 100, quality: 70 },
    card: { width: 300, height: 200, quality: 80 },
    detail: { width: 600, height: 400, quality: 85 },
    hero: { width: 1200, height: 600, quality: 90 },
    avatar: { width: 80, height: 80, quality: 80 },
  };
  
  return sizes[context] || sizes.card;
};

/**
 * 🎨 Extract dominant color from image (placeholder for actual implementation)
 */
export const extractDominantColor = async (imageUrl: string): Promise<string> => {
  // This would require a color extraction library
  // For now, return a default color
  return '#FFC107';
};

/**
 * 📦 Compress image quality
 */
export const getCompressedImageUrl = (
  url: string,
  quality: number = 80
): string => {
  return buildImageUrl(url, { quality });
};

/**
 * 🔄 Convert image format
 */
export const convertImageFormat = (
  url: string,
  format: 'jpeg' | 'png' | 'webp'
): string => {
  return buildImageUrl(url, { format });
};

/**
 * 🖼️ Create image thumbnails
 */
export const createThumbnail = (
  url: string,
  size: number = 150
): string => {
  return buildImageUrl(url, {
    width: size,
    height: size,
    fit: 'cover',
    quality: 75,
  });
};

/**
 * ✂️ Crop image to specific aspect ratio
 */
export const cropToAspectRatio = (
  url: string,
  aspectRatio: number,
  width?: number
): string => {
  const finalWidth = width || 400;
  const finalHeight = Math.round(finalWidth / aspectRatio);
  
  return buildImageUrl(url, {
    width: finalWidth,
    height: finalHeight,
    fit: 'cover',
  });
};

/**
 * 🎭 Add image filters/effects
 */
export const applyImageFilter = (
  url: string,
  filter: 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast'
): string => {
  // This would depend on your image service
  // For now, return the original URL
  return url;
};

/**
 * 📏 Calculate file size from dimensions and quality
 */
export const estimateFileSize = (
  width: number,
  height: number,
  quality: number = 80,
  format: 'jpeg' | 'png' = 'jpeg'
): number => {
  const pixels = width * height;
  
  // Rough estimation based on format and quality
  let bytesPerPixel: number;
  
  if (format === 'png') {
    bytesPerPixel = 3; // PNG is generally larger
  } else {
    // JPEG compression based on quality
    bytesPerPixel = (quality / 100) * 2;
  }
  
  return Math.round(pixels * bytesPerPixel);
};

/**
 * 🔍 Check if URL is an image
 */
export const isImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
  const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
  
  return imageExtensions.test(url) || imageUrlPattern.test(url);
};

/**
 * 🎨 Generate avatar initials image
 */
export const generateAvatarFromInitials = (
  name: string,
  size: number = 100,
  backgroundColor: string = 'FFC107',
  textColor: string = 'FFFFFF'
): string => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  
  return generatePlaceholder(size, size, backgroundColor, textColor, initials);
};

/**
 * 📋 Image utilities object
 */
export const ImageUtils = {
  validateImage,
  calculateAspectRatio,
  calculateDimensions,
  generatePlaceholder,
  getImageDimensions,
  buildImageUrl,
  generateResponsiveImages,
  getOptimalImageSize,
  extractDominantColor,
  getCompressedImageUrl,
  convertImageFormat,
  createThumbnail,
  cropToAspectRatio,
  applyImageFilter,
  estimateFileSize,
  isImageUrl,
  generateAvatarFromInitials,
};

export default ImageUtils;