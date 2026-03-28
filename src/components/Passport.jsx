import { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import StampItem from "./StampItem";
import StickyNote from "./StickyNote";
import TextBox from "./TextBox";
import ImageItem from "./ImageItem";
import bookletOpen from "../assets/cover/booklet-open.png";

const TOTAL_SPREADS = 3;

function BookletCanvas({
  spreadIndex, stamps = [], notes = [], textboxes = [],
  stickers = [], images = [],
  onRemoveStamp, onRemoveNote, onNoteTextChange,
  onRemoveTextbox, onTextboxTextChange,
  onRemoveSticker, onRemoveImage,
  onUpdateStampPosition, onUpdateStickerPosition,
  onUpdateNotePosition, onUpdateTextboxPosition, onUpdateImagePosition,
  onDuplicateStamp, onDuplicateSticker, onDuplicateNote, onDuplicateImage,
  onBringToFront, onSendToBack,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `spread-${spreadIndex}`,
    data: { spreadIndex },
  });

  return (
    <div ref={setNodeRef} className={`booklet-canvas ${isOver ? "booklet-canvas-over" : ""}`}>
      {stamps.map((stamp) => (
        <StampItem
          key={stamp.instanceId}
          stamp={stamp}
          onRemove={() => onRemoveStamp(stamp.instanceId)}
          onDuplicate={() => onDuplicateStamp(stamp.instanceId)}
          onBringToFront={() => onBringToFront('stamp', stamp.instanceId)}
          onSendToBack={() => onSendToBack('stamp', stamp.instanceId)}
          onPositionChange={(x, y) => onUpdateStampPosition(stamp.instanceId, x, y)}
          onSizeChange={(w, h, x, y) => onUpdateStampPosition(stamp.instanceId, x, y, w, h)}
        />
      ))}
      {stickers.map((sticker) => (
        <StampItem
          key={sticker.instanceId}
          stamp={sticker}
          onRemove={() => onRemoveSticker(sticker.instanceId)}
          onDuplicate={() => onDuplicateSticker(sticker.instanceId)}
          onBringToFront={() => onBringToFront('sticker', sticker.instanceId)}
          onSendToBack={() => onSendToBack('sticker', sticker.instanceId)}
          onPositionChange={(x, y) => onUpdateStickerPosition(sticker.instanceId, x, y)}
          onSizeChange={(w, h, x, y) => onUpdateStickerPosition(sticker.instanceId, x, y, w, h)}
        />
      ))}
      {images.map((image) => (
        <ImageItem
          key={image.id}
          image={image}
          onRemove={() => onRemoveImage(image.id)}
          onDuplicate={() => onDuplicateImage(image.id)}
          onBringToFront={() => onBringToFront('image', image.id)}
          onSendToBack={() => onSendToBack('image', image.id)}
          onPositionChange={(x, y) => onUpdateImagePosition(image.id, x, y)}
          onSizeChange={(w, h, x, y) => onUpdateImagePosition(image.id, x, y, w, h)}
        />
      ))}
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onRemove={() => onRemoveNote(note.id)}
          onDuplicate={() => onDuplicateNote(note.id)}
          onBringToFront={() => onBringToFront('note', note.id)}
          onSendToBack={() => onSendToBack('note', note.id)}
          onTextChange={(text) => onNoteTextChange(note.id, text)}
          onPositionChange={(x, y) => onUpdateNotePosition(note.id, x, y)}
          onSizeChange={(w, h, x, y) => onUpdateNotePosition(note.id, x, y, w, h)}
        />
      ))}
      {textboxes.map((tb) => (
        <TextBox
          key={tb.id}
          textbox={tb}
          onRemove={() => onRemoveTextbox(tb.id)}
          onDuplicate={() => onDuplicateNote(tb.id)}
          onBringToFront={() => onBringToFront('note', tb.id)}
          onSendToBack={() => onSendToBack('note', tb.id)}
          onTextChange={(text) => onTextboxTextChange(tb.id, text)}
          onPositionChange={(x, y) => onUpdateTextboxPosition(tb.id, x, y)}
          onSizeChange={(w, h, x, y) => onUpdateTextboxPosition(tb.id, x, y, w, h)}
        />
      ))}
    </div>
  );
}

function Passport({
  pageStamps, pageNotes, pageTextboxes, pageStickers, pageImages,
  onRemoveStamp, onRemoveNote, onNoteTextChange,
  onRemoveTextbox, onTextboxTextChange,
  onRemoveSticker, onRemoveImage,
  onUpdateStampPosition, onUpdateStickerPosition,
  onUpdateNotePosition, onUpdateTextboxPosition, onUpdateImagePosition,
  onDuplicateStamp, onDuplicateSticker, onDuplicateNote, onDuplicateImage,
  onBringToFront, onSendToBack,
  onStampDrop,
}) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [turningLeft, setTurningLeft] = useState(false);
  const [turningRight, setTurningRight] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (onStampDrop) {
      onStampDrop.current = { spreadIndex };
    }
  }, [spreadIndex]);

  const flipNext = () => {
    if (isAnimating || spreadIndex >= TOTAL_SPREADS - 1) return;
    setIsAnimating(true);
    setTurningRight(true);
    setTimeout(() => setSpreadIndex(i => i + 1), 300);
    setTimeout(() => { setTurningRight(false); setIsAnimating(false); }, 600);
  };

  const flipPrev = () => {
    if (isAnimating || spreadIndex <= 0) return;
    setIsAnimating(true);
    setTurningLeft(true);
    setTimeout(() => setSpreadIndex(i => i - 1), 300);
    setTimeout(() => { setTurningLeft(false); setIsAnimating(false); }, 600);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") flipNext();
      if (e.key === "ArrowLeft") flipPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spreadIndex, isAnimating]);

  return (
    <div className="passport-wrapper">
      <div className={`booklet-3d ${turningRight ? "turning-right" : ""} ${turningLeft ? "turning-left" : ""}`}>
        <img src={bookletOpen} alt="" className="booklet-base" />
        <BookletCanvas
          spreadIndex={spreadIndex}
          stamps={pageStamps[spreadIndex] || []}
          notes={pageNotes[spreadIndex] || []}
          textboxes={pageTextboxes[spreadIndex] || []}
          stickers={pageStickers[spreadIndex] || []}
          images={pageImages[spreadIndex] || []}
          onRemoveStamp={(id) => onRemoveStamp(spreadIndex, id)}
          onRemoveNote={(id) => onRemoveNote(spreadIndex, id)}
          onNoteTextChange={(id, text) => onNoteTextChange(spreadIndex, id, text)}
          onRemoveTextbox={(id) => onRemoveTextbox(spreadIndex, id)}
          onTextboxTextChange={(id, text) => onTextboxTextChange(spreadIndex, id, text)}
          onRemoveSticker={(id) => onRemoveSticker(spreadIndex, id)}
          onRemoveImage={(id) => onRemoveImage(spreadIndex, id)}
          onUpdateStampPosition={(id, x, y, w, h) => onUpdateStampPosition(spreadIndex, id, x, y, w, h)}
          onUpdateStickerPosition={(id, x, y, w, h) => onUpdateStickerPosition(spreadIndex, id, x, y, w, h)}
          onUpdateNotePosition={(id, x, y, w, h) => onUpdateNotePosition(spreadIndex, id, x, y, w, h)}
          onUpdateTextboxPosition={(id, x, y, w, h) => onUpdateTextboxPosition(spreadIndex, id, x, y, w, h)}
          onUpdateImagePosition={(id, x, y, w, h) => onUpdateImagePosition(spreadIndex, id, x, y, w, h)}
          onDuplicateStamp={(id) => onDuplicateStamp(spreadIndex, id)}
          onDuplicateSticker={(id) => onDuplicateSticker(spreadIndex, id)}
          onDuplicateNote={(id) => onDuplicateNote(spreadIndex, id)}
          onDuplicateImage={(id) => onDuplicateImage(spreadIndex, id)}
          onBringToFront={(type, id) => onBringToFront(spreadIndex, type, id)}
          onSendToBack={(type, id) => onSendToBack(spreadIndex, type, id)}
        />
      </div>

      <div className="passport-nav">
        <span className="passport-nav-hint">←</span>
        <span className="passport-nav-label">{spreadIndex + 1} / {TOTAL_SPREADS}</span>
        <span className="passport-nav-hint">→</span>
      </div>
    </div>
  );
}

export default Passport;