import { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import stamps from "../data/stamps";
import stickers from "../data/stickers";
import backgrounds from "../data/backgrounds";
import stickyNoteBtnImg from "../assets/sticky-note-btn.png";
import imageBtn from "../assets/image-btn.png";

function DraggableItem({ id, data, children, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  });

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    zIndex: 999,
    opacity: isDragging ? 0.7 : 1,
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function Toolbar({ onSelectStamp, onSelectSticker, onAddNote, onAddText, onSelectBackground, onAddImage }) {
  const [stickerPage, setStickerPage] = useState(0);
  const fileInputRef = useRef(null);

  const stickersPerPage = 6;
  const totalStickerPages = Math.ceil(stickers.length / stickersPerPage);
  const visibleStickers = stickers.slice(
    stickerPage * stickersPerPage,
    (stickerPage + 1) * stickersPerPage
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onAddImage(event.target.result);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be uploaded again
    e.target.value = "";
  };

  return (
    <div className="toolbar-panel">

      {/* ELEMENTS */}
      <div className="tb-section">
        <div className="tb-section-label">ELEMENTS</div>
        <div className="tb-elements-grid">
          <button className="tb-element-btn" onClick={onAddText}>
            <span className="tb-element-icon">T</span>
            <span className="tb-element-text">TEXT</span>
          </button>
          <img
            src={stickyNoteBtnImg}
            alt="Add Sticky Note"
            className="tb-sticky-btn"
            onClick={onAddNote}
          />
          {/* Image upload button */}
          <button
            className="tb-element-btn-2 tb-element-btn-wide"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
                src={imageBtn}
                alt="upload"
                style={{ width: "110px", height: "70px", marginRight: "6px" }}
            />
            <span className="tb-element-text">IMAGE</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <div className="tb-divider" />

      {/* STICKERS */}
      <div className="tb-section">
        <div className="tb-section-row">
          <div className="tb-section-label">STICKERS</div>
          <div className="tb-pagination">
            <button
              className="tb-page-btn"
              onClick={() => setStickerPage(p => Math.max(0, p - 1))}
              disabled={stickerPage === 0}
            >‹</button>
            <button
              className="tb-page-btn"
              onClick={() => setStickerPage(p => Math.min(totalStickerPages - 1, p + 1))}
              disabled={stickerPage >= totalStickerPages - 1 || stickers.length === 0}
            >›</button>
          </div>
        </div>
        <div className="tb-item-grid">
          {stickers.length === 0 ? (
            <p className="tb-empty">Coming soon!</p>
          ) : (
            visibleStickers.map(sticker => (
              <DraggableItem
                key={sticker.id}
                id={`sticker-${sticker.id}`}
                data={{ sticker }}
                onClick={() => onSelectSticker(sticker)}
              >
                <div className="tb-item">
                  <img src={sticker.file} alt="" className="tb-item-img" />
                </div>
              </DraggableItem>
            ))
          )}
        </div>
      </div>

      <div className="tb-divider" />

      {/* STAMPS */}
      <div className="tb-section">
        <div className="tb-section-label">STAMPS</div>
        <div className="tb-item-grid tb-scroll">
          {stamps.map(stamp => (
            <DraggableItem
              key={stamp.id}
              id={`stamp-${stamp.id}`}
              data={{ stamp }}
              onClick={() => onSelectStamp(stamp)}
            >
              <div className="tb-item">
                {stamp.file ? (
                  <img src={stamp.file} alt={stamp.label} className="tb-item-img" />
                ) : (
                  <div className="tb-item-placeholder">{stamp.label}</div>
                )}
                <span className="tb-item-label">{stamp.label}</span>
              </div>
            </DraggableItem>
          ))}
        </div>
      </div>

      <div className="tb-divider" />

      {/* BACKGROUND */}
      <div className="tb-section">
        <div className="tb-section-label">BACKGROUND</div>
        <div className="tb-bg-grid">
          {backgrounds.map(bg => (
            <div
              key={bg.id}
              className="tb-bg-circle"
              onClick={() => onSelectBackground(bg.file)}
              title={bg.label}
            >
              <img src={bg.file} alt={bg.label} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Toolbar;