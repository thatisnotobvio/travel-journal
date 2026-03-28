import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";

function SelectionWrapper({
  children,
  defaultSize = { width: 120, height: 120 },
  defaultPosition = { x: 80, y: 80 },
  minWidth = 60,
  minHeight = 60,
  lockAspectRatio = false,
  onRemove,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onPositionChange,
  onSizeChange,
  disableDraggingWhen = false,
  zIndex = 1,

  itemData,
  OnUpdate,
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const rndRef = useRef(null);
  const rotateStartAngle = useRef(0);
  const rotateStartMouse = useRef(0);

  const handleRotateStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);

    const rect = rndRef.current?.resizableElement?.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    rotateStartAngle.current = rotation;
    rotateStartMouse.current = startAngle;

    const onMouseMove = (moveEvent) => {
      const angle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX
      ) * (180 / Math.PI);
      setRotation(rotateStartAngle.current + (angle - rotateStartMouse.current));
    };

    const onMouseUp = () => {
      setIsRotating(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const wrapperRef = useRef(null);
  const handleGlobalClick = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsSelected(false);
      setShowLayerMenu(false);
    }
  };

  useState(() => {
    window.addEventListener("mousedown", handleGlobalClick);
    return () => window.removeEventListener("mousedown", handleGlobalClick);
  });

  // RIGHT - Use useEffect for side effects!
  useEffect(() => {
    window.addEventListener("mousedown", handleGlobalClick);
    return () => window.removeEventListener("mousedown", handleGlobalClick);
  }, []); // Empty array so it only runs once

  return (
    <Rnd
      ref={rndRef}
      default={{
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: defaultSize.width,
        height: defaultSize.height,
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      lockAspectRatio={lockAspectRatio}
      bounds="parent"
      disableDragging={isRotating || disableDraggingWhen}
      enableResizing={isSelected}
      onMouseDown={() => setIsSelected(true)}
      onDragStop={(e, d) => {
        if (onPositionChange) onPositionChange(d.x, d.y);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (onSizeChange) onSizeChange(
          parseInt(ref.style.width),
          parseInt(ref.style.height),
          position.x,
          position.y
        );
      }}
      style={{ zIndex: isSelected ? 999 : (zIndex || 1) }}
    >
      <div
        ref={wrapperRef}
        className="selection-wrapper"
        onClick={() => setIsSelected(true)}
      >
        {/* Top controls */}
        {isSelected && (
          <div className="selection-controls-top" onMouseDown={e => e.stopPropagation()}>
            
            {/* ONLY SHOW THESE IF IT'S A TEXTBOX */}
            {itemData?.text !== undefined && (
              <>
                {/* Color Picker */}
                <input 
                  type="color" 
                  className="sel-ctrl-color"
                  value={itemData.color || "#4A3F35"}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                />

                {/* Font Family Dropdown */}
                <select 
                  value={itemData.fontFamily || "Instrument Serif"}
                  onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                  className="sel-ctrl-select"
                >
                  <option value="Instrument Serif">Instrument Serif</option>
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier</option>
                </select>

                {/* Font Size Dropdown */}
                <select 
                  value={itemData.fontSize || 24}
                  onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                  className="sel-ctrl-select"
                >
                  <option value="16">16</option>
                  <option value="24">24</option>
                  <option value="32">32</option>
                  <option value="48">48</option>
                </select>
              </>
            )}

            {/* Layer button with dropdown */}
            <div className="sel-ctrl-layer-wrapper">
              <button
                className="sel-ctrl-btn"
                title="Layers"
                onClick={() => setShowLayerMenu(v => !v)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
              </button>

              {/* Layer dropdown */}
              {showLayerMenu && (
                <div className="sel-layer-menu">
                  <button
                    className="sel-layer-option"
                    onClick={() => { onBringToFront?.(); setShowLayerMenu(false); }}
                  >
                    bring to front
                  </button>
                  <button
                    className="sel-layer-option"
                    onClick={() => { onSendToBack?.(); setShowLayerMenu(false); }}
                  >
                    send to back
                  </button>
                </div>
              )}
            </div>

            {/* Duplicate */}
            <button className="sel-ctrl-btn" title="Duplicate" onClick={onDuplicate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>

            {/* Delete */}
            <button className="sel-ctrl-btn sel-ctrl-delete" title="Delete" onClick={onRemove}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        )}

        {/* Content with rotation */}
        <div
          className={`selection-content ${isSelected ? "selection-content-active" : ""}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {children}
        </div>

        {/* Rotate handle */}
        {isSelected && (
          <div className="selection-rotate-handle" onMouseDown={handleRotateStart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </div>
        )}
      </div>
    </Rnd>
  );
}

export default SelectionWrapper;