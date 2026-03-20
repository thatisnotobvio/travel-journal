import { useState, useRef } from "react";
import SelectionWrapper from "./SelectionWrapper";

function TextBox({ textbox, onRemove, onDuplicate, onTextChange, onPositionChange, onSizeChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    onTextChange(e.target.value);
    requestAnimationFrame(() => {
      if (textarea.scrollHeight > textarea.clientHeight) {
        onTextChange(textbox.text);
      }
    });
  };

  return (
    <SelectionWrapper
      defaultSize={{ width: textbox.w || 180, height: textbox.h || 80 }}
      defaultPosition={{ x: textbox.x || 80, y: textbox.y || 80 }}
      minWidth={80}
      minHeight={40}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      disableDraggingWhen={isEditing}
    >
      <div className="textbox" onDoubleClick={() => setIsEditing(true)}>
        <textarea
          ref={textareaRef}
          className="textbox-textarea"
          value={textbox.text}
          onChange={handleChange}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          placeholder="Type here..."
          readOnly={!isEditing}
        />
      </div>
    </SelectionWrapper>
  );
}

export default TextBox;