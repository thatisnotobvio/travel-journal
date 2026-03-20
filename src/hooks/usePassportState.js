import { useState, useEffect } from "react";

const STORAGE_KEY = "india-passport-state";

const getSavedData = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

function usePassportState() {
  const savedData = getSavedData();

  const [pageStamps, setPageStamps] = useState(savedData.pageStamps || {});
  const [pageNotes, setPageNotes] = useState(savedData.pageNotes || {});
  const [pageTextboxes, setPageTextboxes] = useState(savedData.pageTextboxes || {});
  const [pageStickers, setPageStickers] = useState(savedData.pageStickers || {});
  const [pageImages, setPageImages] = useState(savedData.pageImages || {});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pageStamps, pageNotes, pageTextboxes, pageStickers, pageImages,
      }));
    } catch {
      console.warn("Could not save to localStorage");
    }
  }, [pageStamps, pageNotes, pageTextboxes, pageStickers, pageImages]);

  const getCanvasCenter = () => {
    const canvasEl = document.querySelector(".booklet-canvas");
    const rect = canvasEl ? canvasEl.getBoundingClientRect() : { width: 800, height: 600 };
    return { cx: rect.width / 2, cy: rect.height / 2 };
  };

  // ---------------- STAMPS ----------------
  const addStampToPage = (spreadIndex, stamp, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageStamps(prev => ({
      ...prev,
      [spreadIndex]: [...(prev[spreadIndex] || []), {
        ...stamp,
        instanceId: `${stamp.id}-${Date.now()}`,
        x: x ?? cx - 60,
        y: y ?? cy - 60,
      }],
    }));
  };

  const removeStampFromPage = (spreadIndex, instanceId) => {
    setPageStamps(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).filter(s => s.instanceId !== instanceId),
    }));
  };

  const updateStampPosition = (spreadIndex, instanceId, x, y, width, height) => {
    setPageStamps(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(s =>
        s.instanceId === instanceId
          ? { ...s, x, y, ...(width && { width }), ...(height && { height }) }
          : s
      ),
    }));
  };

  // ---------------- STICKERS ----------------
  const addStickerToPage = (spreadIndex, sticker, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageStickers(prev => ({
      ...prev,
      [spreadIndex]: [...(prev[spreadIndex] || []), {
        ...sticker,
        instanceId: `${sticker.id}-${Date.now()}`,
        x: x ?? cx - 60,
        y: y ?? cy - 60,
      }],
    }));
  };

  const removeStickerFromPage = (spreadIndex, instanceId) => {
    setPageStickers(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).filter(s => s.instanceId !== instanceId),
    }));
  };

  const updateStickerPosition = (spreadIndex, instanceId, x, y, width, height) => {
    setPageStickers(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(s =>
        s.instanceId === instanceId
          ? { ...s, x, y, ...(width && { width }), ...(height && { height }) }
          : s
      ),
    }));
  };

  // ---------------- NOTES ----------------
  const addNoteToPage = (spreadIndex, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageNotes(prev => ({
      ...prev,
      [spreadIndex]: [...(prev[spreadIndex] || []), {
        id: `note-${Date.now()}`,
        text: "",
        x: x ?? cx - 100,
        y: y ?? cy - 80,
      }],
    }));
  };

  const removeNoteFromPage = (spreadIndex, noteId) => {
    setPageNotes(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).filter(n => n.id !== noteId),
    }));
  };

  const updateNoteText = (spreadIndex, noteId, text) => {
    setPageNotes(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(n =>
        n.id === noteId ? { ...n, text } : n
      ),
    }));
  };

  const updateNotePosition = (spreadIndex, noteId, x, y, width, height) => {
    setPageNotes(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(n =>
        n.id === noteId
          ? { ...n, x, y, ...(width && { width }), ...(height && { height }) }
          : n
      ),
    }));
  };

  // ---------------- TEXTBOX ----------------
  const addTextboxToPage = (spreadIndex, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageTextboxes(prev => ({
      ...prev,
      [spreadIndex]: [...(prev[spreadIndex] || []), {
        id: `tb-${Date.now()}`,
        text: "",
        x: x ?? cx - 90,
        y: y ?? cy - 40,
      }],
    }));
  };

  const removeTextboxFromPage = (spreadIndex, tbId) => {
    setPageTextboxes(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).filter(t => t.id !== tbId),
    }));
  };

  const updateTextboxText = (spreadIndex, tbId, text) => {
    setPageTextboxes(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(t =>
        t.id === tbId ? { ...t, text } : t
      ),
    }));
  };

  const updateTextboxPosition = (spreadIndex, tbId, x, y, width, height) => {
    setPageTextboxes(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(t =>
        t.id === tbId
          ? { ...t, x, y, ...(width && { width }), ...(height && { height }) }
          : t
      ),
    }));
  };

  // ---------------- IMAGES ----------------
  const addImageToPage = (spreadIndex, src, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageImages(prev => ({
      ...prev,
      [spreadIndex]: [...(prev[spreadIndex] || []), {
        id: `img-${Date.now()}`,
        src,
        x: x ?? cx - 80,
        y: y ?? cy - 80,
      }],
    }));
  };

  const removeImageFromPage = (spreadIndex, imageId) => {
    setPageImages(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).filter(i => i.id !== imageId),
    }));
  };

  const updateImagePosition = (spreadIndex, imageId, x, y, width, height) => {
    setPageImages(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(i =>
        i.id === imageId
          ? { ...i, x, y, ...(width && { width }), ...(height && { height }) }
          : i
      ),
    }));
  };

  // ---------------- RESET ----------------
  const clearAll = () => {
    setPageStamps({});
    setPageNotes({});
    setPageTextboxes({});
    setPageStickers({});
    setPageImages({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    pageStamps, pageNotes, pageTextboxes, pageStickers, pageImages,
    addStampToPage, removeStampFromPage, updateStampPosition,
    addStickerToPage, removeStickerFromPage, updateStickerPosition,
    addNoteToPage, removeNoteFromPage, updateNoteText, updateNotePosition,
    addTextboxToPage, removeTextboxFromPage, updateTextboxText, updateTextboxPosition,
    addImageToPage, removeImageFromPage, updateImagePosition,
    clearAll,
  };
}

export default usePassportState;