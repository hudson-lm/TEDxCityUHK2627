export const optimizedVariantName = (filename, size = "lg") =>
  filename.replace(/\.[^.]+$/, `-${size}.webp`);
