import { useRef, useState } from "react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
// 1. Swapped the library import here
import { toPng } from 'html-to-image'; 
import "./index.css";
import Passport from "./components/Passport";
import Toolbar from "./components/Toolbar";
import usePassportState from "./hooks/usePassportState";
import stamps from "./data/stamps";
import stickers from "./data/stickers";
import clearAllBtn from "./assets/clear-all-btn.png";
import downloadBtn from "./assets/download-btn.png";

function App() {
  const stampDropRef = useRef(null);
  const bookletRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const [deskBg, setDeskBg] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    pageStamps, pageNotes, pageTextboxes, pageStickers, pageImages,
    addStampToPage, removeStampFromPage, updateStampPosition,
    addStickerToPage, removeStickerFromPage, updateStickerPosition,
    addNoteToPage, removeNoteFromPage, updateNoteText, updateNotePosition,
    addTextboxToPage, removeTextboxFromPage, updateTextboxText, updateTextboxPosition,
    addImageToPage, removeImageFromPage, updateImagePosition,
    clearAll,
  } = usePassportState();

  const handleAddImage = (src) => {
    addImageToPage(getCurrentSpread(), src);
  };

  const setBookletRef = (node) => {
    if (node) bookletRef.current = node;
  };

  const getCurrentSpread = () => {
    return stampDropRef.current?.spreadIndex ?? 0;
  };

  const handleSelectStamp = (stamp) => {
    addStampToPage(getCurrentSpread(), stamp);
  };

  const handleSelectSticker = (sticker) => {
    addStickerToPage(getCurrentSpread(), sticker);
  };

  const handleAddNote = () => {
    addNoteToPage(getCurrentSpread());
  };

  const handleAddText = () => {
    addTextboxToPage(getCurrentSpread());
  };

  const handleSelectBackground = (file) => {
    setDeskBg(file);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const stamp = stamps.find(s => `stamp-${s.id}` === active.id);
    const sticker = stickers.find(s => `sticker-${s.id}` === active.id);
    setActiveItem(stamp || sticker || null);
  };

  const handleDragEnd = (event) => {
    setActiveItem(null);
    const { over, active } = event;
    if (!over) return;

    const spreadIndex = over.data?.current?.spreadIndex;
    if (spreadIndex === undefined) return;

    const stamp = active.data?.current?.stamp;
    const sticker = active.data?.current?.sticker;

    const canvasEl = document.querySelector(".booklet-canvas");
    if (!canvasEl) return;

    const canvasRect = canvasEl.getBoundingClientRect();
    const draggedRect = active.rect.current.translated;
    if (!draggedRect) return;

    const x = Math.max(0, Math.min(
      draggedRect.left - canvasRect.left,
      canvasRect.width - 120
    ));
    const y = Math.max(0, Math.min(
      draggedRect.top - canvasRect.top,
      canvasRect.height - 120
    ));

    if (stamp) addStampToPage(spreadIndex, stamp, x, y);
    if (sticker) addStickerToPage(spreadIndex, sticker, x, y);
  };

  // 2. Updated Download Logic
const handleDownload = async () => {
  const target = document.querySelector(".canvas-area");
  const mat = document.querySelector(".mat-container");
  const booklet = document.querySelector(".booklet-3d");

  if (!target || !mat || isDownloading) return;
  setIsDownloading(true);

  // 1. Capture the EXACT current pixel size of the mat as it looks now
  const rect = mat.getBoundingClientRect();
  const originalMatW = rect.width;
  const originalMatH = rect.height;

  // 2. Save original styles
  const originalTargetStyle = target.style.cssText;
  const originalMatStyle = mat.style.cssText;
  const originalBookletStyle = booklet?.style.cssText || "";

  try {
    // Hide UI
    document.querySelectorAll(".selection-controls-top, .selection-rotate-handle")
      .forEach(el => el.style.visibility = "hidden");

    // 3. Define the 16:9 "Photo Studio"
    const exportWidth = target.clientWidth;
    const exportHeight = (exportWidth * 9) / 16;

    // 4. Apply Neutralizing Styles (While PRESERVING the background)
    target.style.cssText = `
      position: relative !important;
      left: 0 !important;
      top: 0 !important;
      width: ${exportWidth}px !important;
      height: ${exportHeight}px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 !important;
      /* Re-apply the background image explicitly */
      background-image: ${deskBg ? `url(${deskBg})` : 'none'} !important;
      background-size: cover !important;
      background-position: center center !important;
      background-repeat: no-repeat !important;
`;

    // 5. Force Mat to PIXELS (Stops the stretching)
    mat.style.cssText = `
      width: ${originalMatW}px !important;
      height: ${originalMatH}px !important;
      transform: none !important;
      perspective: none !important;
      flex-shrink: 0 !important;
    `;

    if (booklet) {
      booklet.style.transform = "none !important";
      booklet.style.perspective = "none !important";
    }

    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 200));

    // 6. Capture
    const dataUrl = await toPng(target, {
      width: exportWidth,
      height: exportHeight,
      pixelRatio: 2,
      cacheBust: true,
    });

    const link = document.createElement("a");
    link.download = `my-journal-16-9.png`;
    link.href = dataUrl;
    link.click();

  } catch (err) {
    console.error("Download failed:", err);
  } finally {
    // 7. Restore
    target.style.cssText = originalTargetStyle;
    mat.style.cssText = originalMatStyle;
    if (booklet) booklet.style.cssText = originalBookletStyle;
    
    document.querySelectorAll(".selection-controls-top, .selection-rotate-handle")
      .forEach(el => el.style.visibility = "");
    setIsDownloading(false);
  }
};

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="sidebar">
        <Toolbar
          onSelectStamp={handleSelectStamp}
          onSelectSticker={handleSelectSticker}
          onAddNote={handleAddNote}
          onAddText={handleAddText}
          onSelectBackground={handleSelectBackground}
          onAddImage={handleAddImage}
        />
        <div className="sidebar-actions">
          <img
            src={clearAllBtn}
            alt="Clear All"
            className="action-btn-img"
            onClick={clearAll}
          />
          <img
            src={downloadBtn}
            alt="Download"
            className={`action-btn-img ${isDownloading ? "action-btn-loading" : ""}`}
            onClick={handleDownload}
          />
        </div>
      </div>

      <div
        className="canvas-area"
        style={deskBg ? { backgroundImage: `url(${deskBg})` } : {}}
      >
        <div className="mat-container">
          <div className="mat-inner">
            <div ref={setBookletRef} id="booklet-capture">
              <Passport
                pageStamps={pageStamps}
                pageNotes={pageNotes}
                pageTextboxes={pageTextboxes}
                pageStickers={pageStickers}
                pageImages={pageImages}
                onRemoveStamp={removeStampFromPage}
                onRemoveNote={removeNoteFromPage}
                onNoteTextChange={updateNoteText}
                onRemoveTextbox={removeTextboxFromPage}
                onTextboxTextChange={updateTextboxText}
                onRemoveSticker={removeStickerFromPage}
                onRemoveImage={removeImageFromPage}
                onUpdateStampPosition={updateStampPosition}
                onUpdateStickerPosition={updateStickerPosition}
                onUpdateNotePosition={updateNotePosition}
                onUpdateTextboxPosition={updateTextboxPosition}
                onUpdateImagePosition={updateImagePosition}
                onStampDrop={stampDropRef}
              />
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="stamp-drag-overlay">
            {activeItem.file ? (
              <img src={activeItem.file} alt={activeItem.label || ""} />
            ) : (
              <div className="tb-item-placeholder">{activeItem.label}</div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;