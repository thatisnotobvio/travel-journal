import SelectionWrapper from "./SelectionWrapper";

function ImageItem({ image, onRemove, onPositionChange, onSizeChange }) {
  return (
    <SelectionWrapper
      defaultSize={{ width: image.w || 160, height: image.h || 160 }}
      defaultPosition={{ x: image.x || 80, y: image.y || 80 }}
      minWidth={60}
      minHeight={60}
      onRemove={onRemove}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
    >
      <img
        src={image.src}
        alt="uploaded"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          display: "block",
        }}
      />
    </SelectionWrapper>
  );
}

export default ImageItem;