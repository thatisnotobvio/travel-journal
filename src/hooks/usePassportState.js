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

  // Get max zIndex across ALL element types on a spread
  const getNextZIndex = (spreadIndex, currentStamps, currentStickers, currentNotes, currentTextboxes, currentImages) => {
    const all = [
      ...(currentStamps[spreadIndex] || []),
      ...(currentStickers[spreadIndex] || []),
      ...(currentNotes[spreadIndex] || []),
      ...(currentTextboxes[spreadIndex] || []),
      ...(currentImages[spreadIndex] || []),
    ];
    return all.length > 0 ? Math.max(...all.map(i => i.zIndex || 0)) + 1 : 1;
  };

  // ---------------- STAMPS ----------------
  const addStampToPage = (spreadIndex, stamp, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageStamps(prev => {
      const nextZ = getNextZIndex(spreadIndex, prev, pageStickers, pageNotes, pageTextboxes, pageImages);
      return {
        ...prev,
        [spreadIndex]: [...(prev[spreadIndex] || []), {
          ...stamp,
          instanceId: `${stamp.id}-${Date.now()}`,
          x: x ?? cx - 60,
          y: y ?? cy - 60,
          zIndex: nextZ,
        }],
      };
    });
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

  const duplicateStamp = (spreadIndex, instanceId) => {
    setPageStamps(prev => {
      const items = prev[spreadIndex] || [];
      const item = items.find(s => s.instanceId === instanceId);
      if (!item) return prev;
      const nextZ = getNextZIndex(spreadIndex, prev, pageStickers, pageNotes, pageTextboxes, pageImages);
      return {
        ...prev,
        [spreadIndex]: [...items, { ...item, instanceId: `${item.id}-${Date.now()}`, x: (item.x || 0) + 20, y: (item.y || 0) + 20, zIndex: nextZ }]
      };
    });
  };

  // ---------------- STICKERS ----------------
  const addStickerToPage = (spreadIndex, sticker, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageStickers(prev => {
      const nextZ = getNextZIndex(spreadIndex, pageStamps, prev, pageNotes, pageTextboxes, pageImages);
      return {
        ...prev,
        [spreadIndex]: [...(prev[spreadIndex] || []), {
          ...sticker,
          instanceId: `${sticker.id}-${Date.now()}`,
          x: x ?? cx - 60,
          y: y ?? cy - 60,
          zIndex: nextZ,
        }],
      };
    });
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

  const duplicateSticker = (spreadIndex, instanceId) => {
    setPageStickers(prev => {
      const items = prev[spreadIndex] || [];
      const item = items.find(s => s.instanceId === instanceId);
      if (!item) return prev;
      const nextZ = getNextZIndex(spreadIndex, pageStamps, prev, pageNotes, pageTextboxes, pageImages);
      return {
        ...prev,
        [spreadIndex]: [...items, { ...item, instanceId: `${item.id}-${Date.now()}`, x: (item.x || 0) + 20, y: (item.y || 0) + 20, zIndex: nextZ }]
      };
    });
  };

  // ---------------- NOTES ----------------
  const addNoteToPage = (spreadIndex, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageNotes(prev => {
      const nextZ = getNextZIndex(spreadIndex, pageStamps, pageStickers, prev, pageTextboxes, pageImages);
      return {
        ...prev,
        [spreadIndex]: [...(prev[spreadIndex] || []), {
          id: `note-${Date.now()}`,
          text: "",
          x: x ?? cx - 100,
          y: y ?? cy - 80,
          zIndex: nextZ,
        }],
      };
    });
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

  const duplicateNote = (spreadIndex, noteId) => {
    setPageNotes(prev => {
      const items = prev[spreadIndex] || [];
      const item = items.find(n => n.id === noteId);
      if (!item) return prev;
      const nextZ = getNextZIndex(spreadIndex, pageStamps, pageStickers, prev, pageTextboxes, pageImages);
      return {
        ...prev,
        [spreadIndex]: [...items, { ...item, id: `note-${Date.now()}`, x: (item.x || 0) + 20, y: (item.y || 0) + 20, zIndex: nextZ }]
      };
    });
  };

  // ---------------- TEXTBOX ----------------
  const addTextboxToPage = (spreadIndex, x = null, y = null) => {
    const { cx, cy } = getCanvasCenter();
    setPageTextboxes(prev => {
      const nextZ = getNextZIndex(spreadIndex, pageStamps, pageStickers, pageNotes, prev, pageImages);
      return {
        ...prev,
        [spreadIndex]: [...(prev[spreadIndex] || []), {
          id: `tb-${Date.now()}`,
          text: "",
          x: x ?? cx - 90,
          y: y ?? cy - 40,
          zIndex: nextZ,
        }],
      };
    });
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

  const updateTextbox = (spreadIndex, tbId, updates) => {
    setPageTextboxes(prev => ({
      ...prev,
      [spreadIndex]: (prev[spreadIndex] || []).map(t =>
        t.id === tbId ? { ...t, ...updates } : t
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
    setPageImages(prev => {
      const nextZ = getNextZIndex(spreadIndex, pageStamps, pageStickers, pageNotes, pageTextboxes, prev);
      return {
        ...prev,
        [spreadIndex]: [...(prev[spreadIndex] || []), {
          id: `img-${Date.now()}`,
          src,
          x: x ?? cx - 80,
          y: y ?? cy - 80,
          zIndex: nextZ,
        }],
      };
    });
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

  const duplicateImage = (spreadIndex, imageId) => {
    setPageImages(prev => {
      const items = prev[spreadIndex] || [];
      const item = items.find(i => i.id === imageId);
      if (!item) return prev;
      const nextZ = getNextZIndex(spreadIndex, pageStamps, pageStickers, pageNotes, pageTextboxes, prev);
      return {
        ...prev,
        [spreadIndex]: [...items, { ...item, id: `img-${Date.now()}`, x: (item.x || 0) + 20, y: (item.y || 0) + 20, zIndex: nextZ }]
      };
    });
  };

  // ---------------- BRING TO FRONT / SEND TO BACK ----------------
  const bringToFront = (spreadIndex, type, id) => {
    const allItems = [
      ...(pageStamps[spreadIndex] || []),
      ...(pageStickers[spreadIndex] || []),
      ...(pageNotes[spreadIndex] || []),
      ...(pageTextboxes[spreadIndex] || []),
      ...(pageImages[spreadIndex] || []),
    ];
    const maxZ = allItems.length > 0 ? Math.max(...allItems.map(i => i.zIndex || 0)) : 0;
    const newZ = maxZ + 1;

    if (type === 'stamp') setPageStamps(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(s => s.instanceId === id ? { ...s, zIndex: newZ } : s) }));
    if (type === 'sticker') setPageStickers(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(s => s.instanceId === id ? { ...s, zIndex: newZ } : s) }));
    if (type === 'note') setPageNotes(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(n => n.id === id ? { ...n, zIndex: newZ } : n) }));
    if (type === 'textbox') setPageTextboxes(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(t => t.id === id ? { ...t, zIndex: newZ } : t) }));
    if (type === 'image') setPageImages(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(i => i.id === id ? { ...i, zIndex: newZ } : i) }));
  };

  const sendToBack = (spreadIndex, type, id) => {
    const allItems = [
      ...(pageStamps[spreadIndex] || []),
      ...(pageStickers[spreadIndex] || []),
      ...(pageNotes[spreadIndex] || []),
      ...(pageTextboxes[spreadIndex] || []),
      ...(pageImages[spreadIndex] || []),
    ];
    const minZ = allItems.length > 0 ? Math.min(...allItems.map(i => i.zIndex || 0)) : 0;
    const newZ = minZ - 1;

    if (type === 'stamp') setPageStamps(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(s => s.instanceId === id ? { ...s, zIndex: newZ } : s) }));
    if (type === 'sticker') setPageStickers(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(s => s.instanceId === id ? { ...s, zIndex: newZ } : s) }));
    if (type === 'note') setPageNotes(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(n => n.id === id ? { ...n, zIndex: newZ } : n) }));
    if (type === 'textbox') setPageTextboxes(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(t => t.id === id ? { ...t, zIndex: newZ } : t) }));
    if (type === 'image') setPageImages(prev => ({ ...prev, [spreadIndex]: (prev[spreadIndex] || []).map(i => i.id === id ? { ...i, zIndex: newZ } : i) }));
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
    addStampToPage, removeStampFromPage, updateStampPosition, duplicateStamp,
    addStickerToPage, removeStickerFromPage, updateStickerPosition, duplicateSticker,
    addNoteToPage, removeNoteFromPage, updateNoteText, updateNotePosition, duplicateNote,
    addTextboxToPage, removeTextboxFromPage, updateTextboxText, updateTextboxPosition,
    addImageToPage, removeImageFromPage, updateImagePosition, duplicateImage,
    bringToFront, sendToBack, updateTextbox,
    clearAll,
  };
}

export default usePassportState;