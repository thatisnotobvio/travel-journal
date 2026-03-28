import { useState, useRef } from "react";
import SelectionWrapper from "./SelectionWrapper";
import stickyNoteImg from "../assets/sticky-note.png";

function StickyNote({ note, onRemove, onDuplicate, onTextChange, onPositionChange, onSizeChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    onTextChange(e.target.value);
    requestAnimationFrame(() => {
      if (textarea.scrollHeight > textarea.clientHeight) {
        onTextChange(note.text);
      }
    });
  };

  return (
    <SelectionWrapper
      defaultSize={{ width: note.w || 200, height: note.h || 160 }}
      defaultPosition={{ x: note.x || 80, y: note.y || 80 }}
      minWidth={140}
      minHeight={110}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      zIndex={note.zIndex || 1}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      disableDraggingWhen={isEditing}
    >
      <div className="sticky-note" onDoubleClick={() => setIsEditing(true)}>
        <img src={stickyNoteImg} alt="" className="sticky-note-bg" />
        <textarea
          ref={textareaRef}
          className="sticky-note-textarea"
          value={note.text}
          onChange={handleChange}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          placeholder="Write here..."
          readOnly={!isEditing}
        />
      </div>
    </SelectionWrapper>
  );
}

export default StickyNote;