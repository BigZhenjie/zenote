import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Plus, Trash2, Maximize2 } from "lucide-react";
import { debounce } from "lodash";
import { BlockProps } from "@/types";
import { invoke } from "@tauri-apps/api/core";

interface OptionalBlockProps extends Partial<BlockProps> {
  pageId: string;
  index: number;
  blocks: BlockProps[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>;
}

interface ImageContent {
  url: string;
  width?: string | number;
  height?: string | number;
}

// Utility to parse content
const parseContent = (content: string): ImageContent => {
  try {
    const url = new URL(content);
    const width = url.searchParams.get("width") || "auto";
    const height = url.searchParams.get("height") || "auto";
    console.log(url.origin + url.pathname)
    return { url: url.origin + url.pathname, width, height };
  } catch {
    return { url: content, width: "auto", height: "auto" };
  }
};

const ImageBlock = ({ id, content = "", index, blocks, setBlocks, pageId }: OptionalBlockProps) => {
  const { url: imageUrl, width: initW, height: initH } = useMemo(
    () => parseContent(content),
    [content]
  );

  const [dimensions, setDimensions] = useState({
    width: initW ?? "auto",
    height: initH ?? "auto",
  });
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeControls, setShowSizeControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<'width' | 'height' | 'both'>('both');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [origSize, setOrigSize] = useState({ width: 0, height: 0 });

  const imgRef = useRef<HTMLImageElement>(null);

  // Delete block
  const deleteBlock = useCallback(async () => {
    if (!id) return;
    try {
      await invoke('delete_block', { blockId: id });
      setBlocks(bs => bs.filter(b => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  }, [id, setBlocks]);

  // Debounced save
  const updateImageSize = useMemo(
    () =>
      debounce(async (w: string | number, h: string | number) => {
        if (!id) return;
        try {
          const url = new URL(imageUrl);
          url.searchParams.set("width", String(w));
          url.searchParams.set("height", String(h));
          const updatedUrl = url.toString();
  
          await invoke("update_block", {
            blockId: id,
            content: updatedUrl, // The updated content (e.g., JSON string with URL and dimensions)
            pageId: pageId,
            parentBlockId: null, // Or the actual parent block ID if applicable
            order: index, // Use the block's index as the order
            blockType: "image", // Specify the block type as "image"
          });
          setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, content: updatedUrl } : b)));
        } catch (err) {
          console.error(err);
        }
      }, 500),
    [id, imageUrl, setBlocks]
  );

  // Cancel on unmount
  useEffect(() => {
    return () => updateImageSize.cancel();
  }, [updateImageSize]);

  // Resize event handlers
  const handleResize = useCallback(
    (e: MouseEvent) => {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      let { width, height } = origSize;
      if (resizeDir === 'width' || resizeDir === 'both') {
        width = Math.max(50, origSize.width + dx);
      }
      if (resizeDir === 'height' || resizeDir === 'both') {
        height = Math.max(50, origSize.height + dy);
      }
      setDimensions({ width: `${width}px`, height: `${height}px` });
    },
    [startPos, origSize, resizeDir]
  );

  const stopResize = useCallback(() => {
    if (!isResizing) return;
    setIsResizing(false);
    updateImageSize(dimensions.width, dimensions.height);
  }, [isResizing, dimensions, updateImageSize]);

  // Attach listeners
  useEffect(() => {
    if (!isResizing) return;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, handleResize, stopResize]);

  const startResize = useCallback(
    (e: React.MouseEvent, dir: 'width' | 'height' | 'both') => {
      e.preventDefault();
      if (!imgRef.current) return;
      setResizeDir(dir);
      setIsResizing(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setOrigSize({ width: imgRef.current.offsetWidth, height: imgRef.current.offsetHeight });
      // normalize px
      setDimensions(d => ({
        width: `${imgRef.current!.offsetWidth}px`,
        height: `${imgRef.current!.offsetHeight}px`,
      }));
    }, []);

  // Control handlers
  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const w = e.target.value;
      setDimensions(d => ({ ...d, width: w }));
      updateImageSize(w, dimensions.height);
    }, [dimensions.height, updateImageSize]
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = e.target.value;
      setDimensions(d => ({ ...d, height: h }));
      updateImageSize(dimensions.width, h);
    }, [dimensions.width, updateImageSize]
  );

  const setFull = useCallback(() => {
    setDimensions({ width: '100%', height: 'auto' });
    updateImageSize('100%', 'auto');
  }, [updateImageSize]);

  const setSmall = useCallback(() => {
    setDimensions({ width: '50%', height: 'auto' });
    updateImageSize('50%', 'auto');
  }, [updateImageSize]);

  return (
    <div
    className="w-[80%] flex flex-col items-start relative mb-2"
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
  >
      {isHovered && (
      <div className="absolute left-0 translate-x-[-100%] flex justify-end">
        <Plus size={25} className="hover:bg-gray-100 rounded p-1" />
        {id && <Trash2 size={25} className="hover:bg-gray-100 rounded p-1" onClick={deleteBlock} />}
      </div>
    )}

{showSizeControls && (
      <div className="w-full mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
        <label className="text-xs">W:</label>
        <input
          value={dimensions.width}
          onChange={handleWidthChange}
          className="w-20 text-sm border rounded px-1"
        />
        <label className="text-xs">H:</label>
        <input
          value={dimensions.height}
          onChange={handleHeightChange}
          className="w-20 text-sm border rounded px-1"
        />
        <button
          onClick={setFull}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          Full
        </button>
        <button
          onClick={setSmall}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          Small
        </button>
      </div>
    )}

<div className="relative inline-block">
      <img
        ref={imgRef}
        src={`${imageUrl}?width=${dimensions.width}&height=${dimensions.height}`}
        alt=""
        style={{ width: dimensions.width, height: dimensions.height }}
        className="max-w-full"
      />

      {isHovered && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-400 cursor-se-resize"
            onMouseDown={(e) => startResize(e, "both")}
            style={{ transform: "translate(25%,25%)" }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-4 h-4 bg-white border border-gray-400 cursor-s-resize"
            onMouseDown={(e) => startResize(e, "height")}
            style={{ transform: "translate(-50%,50%)" }}
          />
          <div
            className="absolute top-1/2 right-0 w-4 h-4 bg-white border border-gray-400 cursor-e-resize"
            onMouseDown={(e) => startResize(e, "width")}
            style={{ transform: "translate(50%,-50%)" }}
          />
        </>
      )}
    </div>
  </div>
  );
};

export default ImageBlock;
