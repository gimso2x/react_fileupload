import { useCallback, useRef, useState, useEffect } from "react";
import styles from "./dragAndDrop.module.css";

const DragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<{ id: number; object: File }[]>([]);

  const dragRef = useRef<HTMLLabelElement | null>(null);
  const fileId = useRef(0);

  const onChangeFiles = useCallback(
    (e: any) => {
      let selectFiles = [];
      let tempFiles: { id: number; object: File }[] = files;

      if (e.type === "drop") {
        selectFiles = e.dataTransfer.files;
      } else {
        selectFiles = e.target.files;
      }

      if (Array.from(selectFiles).length > 10) {
        alert("10개부턴 안되요");
        return;
      }
      if (
        Array.from(selectFiles).some(
          (file: any) =>
            !file.type.includes("image") && !file.type.includes("pdf")
        )
      ) {
        alert("image나 pdf만 올릴수 있습니다");
        return;
      }

      for (const file of selectFiles) {
        tempFiles = [
          ...tempFiles,
          {
            id: fileId.current++,
            object: file,
          },
        ];
      }

      setFiles(tempFiles);
    },
    [files]
  );

  const handleFilterFile = useCallback(
    (id: number) => {
      setFiles(files.filter((file) => file.id !== id));
    },
    [files]
  );

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer!.files) {
      setIsDragging(true);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onChangeFiles(e);
      setIsDragging(false);
    },
    [onChangeFiles]
  );

  const initDragEvents = useCallback(() => {
    if (dragRef.current !== null) {
      dragRef.current.addEventListener("dragenter", handleDragIn);
      dragRef.current.addEventListener("dragleave", handleDragOut);
      dragRef.current.addEventListener("dragover", handleDragOver);
      dragRef.current.addEventListener("drop", handleDrop);
    }
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  const resetDragEvents = useCallback(() => {
    if (dragRef.current !== null) {
      dragRef.current.removeEventListener("dragenter", handleDragIn);
      dragRef.current.removeEventListener("dragleave", handleDragOut);
      dragRef.current.removeEventListener("dragover", handleDragOver);
      dragRef.current.removeEventListener("drop", handleDrop);
    }
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  const submit = async () => {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i].object);
    }

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
      });
  };

  useEffect(() => {
    initDragEvents();

    return () => resetDragEvents();
  }, [initDragEvents, resetDragEvents]);

  return (
    <div>
      <input
        type="file"
        id="fileUpload"
        accept="image/*, .pdf"
        style={{ display: "none" }}
        multiple={true}
        onChange={onChangeFiles}
      />

      <label
        className={`${styles.wrap} ${isDragging ? "dragging" : "dropped"}`}
        htmlFor="fileUpload"
        ref={dragRef}
      >
        <div>파일 첨부</div>
      </label>

      <div className={styles.ul}>
        {files.length > 0 &&
          files.map((file) => {
            const {
              id,
              object: { name },
            } = file;

            return (
              <div key={id} className={styles.li}>
                <div>{name}</div>
                <div onClick={() => handleFilterFile(id)}>파일삭제</div>
              </div>
            );
          })}
      </div>
      <button onClick={submit}>파일전송</button>
    </div>
  );
};

export default DragAndDrop;
