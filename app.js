import * as pdfjsLib from
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const {
  PDFDocument,
  rgb,
  degrees
} = PDFLib;

let pdfDocument = null;
let pdfBytes = null;
let currentPage = 1;
let totalPages = 0;
let scale = 1.4;

let drawing = false;
let drawMode = false;

const pdfInput = document.getElementById("pdfInput");
const pdfCanvas = document.getElementById("pdfCanvas");
const drawingCanvas = document.getElementById("drawingCanvas");

const pdfCtx = pdfCanvas.getContext("2d");
const drawCtx = drawingCanvas.getContext("2d");

const canvasWrapper = document.getElementById("canvasWrapper");
const thumbnails = document.getElementById("thumbnails");

const emptyState = document.getElementById("emptyState");
const pdfContainer = document.getElementById("pdfContainer");

const pageInfo = document.getElementById("pageInfo");


// =============================
// OPEN PDF
// =============================

pdfInput.addEventListener("change", async (event) => {

  const file = event.target.files[0];

  if (!file) return;

  pdfBytes = await file.arrayBuffer();

  pdfDocument = await pdfjsLib.getDocument({
    data: pdfBytes.slice(0)
  }).promise;

  totalPages = pdfDocument.numPages;
  currentPage = 1;

  emptyState.classList.add("hidden");
  pdfContainer.classList.remove("hidden");

  createThumbnails();

  await renderPage(currentPage);
});


// =============================
// RENDER PAGE
// =============================

async function renderPage(pageNumber) {

  if (!pdfDocument) return;

  const page = await pdfDocument.getPage(pageNumber);

  const viewport = page.getViewport({
    scale: scale
  });

  pdfCanvas.width = viewport.width;
  pdfCanvas.height = viewport.height;

  drawingCanvas.width = viewport.width;
  drawingCanvas.height = viewport.height;

  canvasWrapper.style.width =
    viewport.width + "px";

  canvasWrapper.style.height =
    viewport.height + "px";

  await page.render({
    canvasContext: pdfCtx,
    viewport: viewport
  }).promise;

  drawCtx.clearRect(
    0,
    0,
    drawingCanvas.width,
    drawingCanvas.height
  );

  pageInfo.textContent =
    `Page ${currentPage} / ${totalPages}`;

  updateActiveThumbnail();
}


// =============================
// THUMBNAILS
// =============================

async function createThumbnails() {

  thumbnails.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {

    const page =
      await pdfDocument.getPage(i);

    const viewport =
      page.getViewport({
        scale: 0.2
      });

    const canvas =
      document.createElement("canvas");

    canvas.width =
      viewport.width;

    canvas.height =
      viewport.height;

    const ctx =
      canvas.getContext("2d");

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    const box =
      document.createElement("div");

    box.className =
      "thumbnail";

    box.dataset.page = i;

    box.appendChild(canvas);

    box.addEventListener(
      "click",
      async () => {

        currentPage = i;

        await renderPage(
          currentPage
        );

      }
    );

    thumbnails.appendChild(box);
  }

  updateActiveThumbnail();
}


function updateActiveThumbnail() {

  document
    .querySelectorAll(".thumbnail")
    .forEach(item => {

      item.classList.remove(
        "active"
      );

      if (
        Number(item.dataset.page)
        === currentPage
      ) {

        item.classList.add(
          "active"
        );

      }

    });
}


// =============================
// PAGE NAVIGATION
// =============================

document
  .getElementById("prevPage")
  .addEventListener(
    "click",
    async () => {

      if (currentPage <= 1)
        return;

      currentPage--;

      await renderPage(
        currentPage
      );
    }
  );


document
  .getElementById("nextPage")
  .addEventListener(
    "click",
    async () => {

      if (
        currentPage >= totalPages
      )
        return;

      currentPage++;

      await renderPage(
        currentPage
      );
    }
  );


// =============================
// DRAW
// =============================

document
  .getElementById("drawBtn")
  .addEventListener(
    "click",
    () => {

      drawMode = !drawMode;

      drawingCanvas.style.pointerEvents =
        drawMode
          ? "auto"
          : "none";

    }
  );


drawingCanvas.addEventListener(
  "pointerdown",
  (e) => {

    if (!drawMode) return;

    drawing = true;

    drawCtx.beginPath();

    drawCtx.moveTo(
      e.offsetX,
      e.offsetY
    );

  }
);


drawingCanvas.addEventListener(
  "pointermove",
  (e) => {

    if (
      !drawing ||
      !drawMode
    )
      return;

    drawCtx.lineWidth = 3;

    drawCtx.lineCap = "round";

    drawCtx.strokeStyle =
      "#2563eb";

    drawCtx.lineTo(
      e.offsetX,
      e.offsetY
    );

    drawCtx.stroke();

  }
);


drawingCanvas.addEventListener(
  "pointerup",
  () => {

    drawing = false;

  }
);


// =============================
// ADD TEXT
// =============================

document
  .getElementById("addTextBtn")
  .addEventListener(
    "click",
    () => {

      if (!pdfDocument)
        return;

      const input =
        document.createElement(
          "input"
        );

      input.className =
        "text-editor";

      input.placeholder =
        "Type text...";

      input.style.left =
        "40px";

      input.style.top =
        "40px";

      document
        .getElementById(
          "textLayer"
        )
        .appendChild(input);

      input.focus();

      input.addEventListener(
        "keydown",
        (e) => {

          if (
            e.key === "Enter"
          ) {

            input.blur();

          }

        }
      );

    }
  );


// =============================
// CLEAR DRAWING
// =============================

document
  .getElementById("clearBtn")
  .addEventListener(
    "click",
    () => {

      drawCtx.clearRect(
        0,
        0,
        drawingCanvas.width,
        drawingCanvas.height
      );

    }
  );


// =============================
// ROTATE PAGE
// =============================

document
  .getElementById("rotateBtn")
  .addEventListener(
    "click",
    async () => {

      if (!pdfBytes)
        return;

      const pdf =
        await PDFDocument.load(
          pdfBytes
        );

      const page =
        pdf.getPages()[
          currentPage - 1
        ];

      const oldRotation =
        page.getRotation().angle;

      page.setRotation(
        degrees(
          (oldRotation + 90) % 360
        )
      );

      pdfBytes =
        await pdf.save();

      pdfDocument =
        await pdfjsLib
          .getDocument({
            data:
              pdfBytes.slice(0)
          })
          .promise;

      await renderPage(
        currentPage
      );

    }
  );


// =============================
// DOWNLOAD
// =============================

document
  .getElementById("downloadBtn")
  .addEventListener(
    "click",
    async () => {

      if (!pdfBytes) {

        alert(
          "Please open a PDF first."
        );

        return;
      }

      const pdf =
        await PDFDocument.load(
          pdfBytes
        );

      const pages =
        pdf.getPages();

      const page =
        pages[currentPage - 1];


      // Add drawing

      if (
        drawingCanvas.width > 0
      ) {

        const pngData =
          drawingCanvas.toDataURL(
            "image/png"
          );

        const pngImage =
          await pdf.embedPng(
            pngData
          );

        page.drawImage(
          pngImage,
          {
            x: 0,
            y: 0,
            width:
              page.getWidth(),
            height:
              page.getHeight(),
            opacity: 1
          }
        );

      }


      // Add text

      const textInputs =
        document.querySelectorAll(
          ".text-editor"
        );

      textInputs.forEach(
        (input) => {

          const text =
            input.value.trim();

          if (!text)
            return;

          const x =
            parseFloat(
              input.style.left
            ) / scale;

          const y =
            page.getHeight() -
            parseFloat(
              input.style.top
            ) / scale -
            20;

          page.drawText(
            text,
            {
              x: x,
              y: y,
              size: 18,
              color:
                rgb(0, 0, 0)
            }
          );

        }
      );


      const output =
        await pdf.save();

      const blob =
        new Blob(
          [output],
          {
            type:
              "application/pdf"
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const a =
        document.createElement(
          "a"
        );

      a.href = url;

      a.download =
        "edited-pdf.pdf";

      a.click();

      URL.revokeObjectURL(
        url
      );

    }
  );
