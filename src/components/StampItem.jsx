import SelectionWrapper from "./SelectionWrapper";

function StampItem({ stamp, onRemove, onDuplicate, onBringToFront, onSendToBack, onPositionChange, onSizeChange }) {
  return (
    <SelectionWrapper
      defaultSize={{ width: stamp.width || 120, height: stamp.height || 120 }}
      defaultPosition={{ x: stamp.x || 80, y: stamp.y || 80 }}
      minWidth={60}
      minHeight={60}
      lockAspectRatio={true}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onBringToFront={onBringToFront}
      onSendToBack={onSendToBack}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
    >
      {stamp.file ? (
        <img src={stamp.file} alt={stamp.label} className="stamp-item-img" />
      ) : (
        <div className="stamp-item-placeholder">{stamp.label}</div>
      )}
    </SelectionWrapper>
  );
}

export default StampItem;