document.addEventListener("DOMContentLoaded", function () {
	// Global Variables
	let chapterList = document.querySelector(".chapter-list"),
		editorSection = document.querySelector(".editor-section"),
		chapterAccordion = document.querySelector(".accordion"),
		addBtn = document.querySelector(".add"),
		chapterContainerElement = document.querySelector(".chapters"),
		mobileView = window.innerWidth > 500 ? false : true,
		lettersCount = [[1, 0]];

	let toolbarOptions = [
		[
			{
				header: 1,
			},
			"bold",
			"italic",
			"underline",
			"blockquote",
			"code-block",
			{
				list: "bullet",
			},
			{
				list: "ordered",
			},
			{
				align: [],
			},
		],
	];

	if (mobileView) {
		let chapterAccordion1 = new Quill("#chapter-accordion-1 .editor", {
			modules: {
				toolbar: toolbarOptions,
			},
			theme: "snow",
		});
		chapterAccordion1.on("text-change", function () {
			let textLen = chapterAccordion1.getLength();
			for(let i = 0; lettersCount.length > i; i++){
				if(lettersCount[i][0] == 1){
					lettersCount[i][1] = textLen;
					break; 
				}
			}
			calcChapters(lettersCount, true);
		});

	} else {
		let chapterEditor1 = new Quill("#chapter-editor-1 .editor", {
			modules: {
				toolbar: toolbarOptions,
			},
			theme: "snow",
		});

		chapterEditor1.on("text-change", function () {
			let textLen = chapterEditor1.getLength(),
				editorFullContent = document.querySelector(
					"#chapter-editor-1 .ql-editor"
				).innerHTML,
				previewContainer = document.querySelector(
					"#chapter-preview-1 .chapterPreviewContainer"
				),
				chapterTitle = document.querySelector("#chapter-title-1 input").value,
                oldDOM = [];
                
            previewContainer.querySelectorAll(".preview").forEach(e => {
                let childrenLen = e.children.length, 
                    i = 0; 
                if(childrenLen > 0){
                    for(i; childrenLen > i; i++){
                        oldDOM.push(e.children[i]); 
                    }
                }
            });

			previewContainer.innerHTML = "";

			appendChunksToPages(
				getNodeChunks(editorFullContent, oldDOM),
				previewContainer,
				chapterTitle
			);

			document.querySelectorAll(".chapter-pageNum").forEach((e, i) => {
				e.innerHTML = i + 1;
			});

			for(let i = 0; lettersCount.length > i; i++){
				if(lettersCount[i][0] == 1){
					lettersCount[i][1] = textLen;
					break; 
				}
			}
			calcChapters(lettersCount);
		});
	}

	// Conditional Variables

	// add new chapter.
	addBtn.addEventListener("click", function () {
		let chapterTitleCount = document.querySelectorAll(".chapter-title").length;
		if (mobileView) {
			chapterTitleCount = document.querySelectorAll(".accordion-item").length;
		}
		let chapterID = Date.now();

		if (mobileView) {
			// Mobile functionality.
			chapterAccordion.insertAdjacentHTML(
				"beforeend",
				`  
      <div class="accordion-item rounded-0" id="chapter-accordion-${chapterID}">
          <h2 class="accordion-header align-items-center d-flex flex-row-reverse" id="heading-${chapterID}" >
              <input class="accordion-button content px-1 rounded-0" type="text" data-bs-toggle="collapse"
                  data-bs-target="#collapse-${chapterID}" aria-expanded="true" aria-controls="collapse-${chapterID}"  placeholder="Add chapter title" />
              <span class="chapterNumber">${chapterTitleCount+1}.</span>
          </h2>
          <div class="progressbar-back">
              <div class="progressbar-val"></div>
          </div>    
          <div id="collapse-${chapterID}" class="accordion-collapse px-2 rounded-0 collapse show" aria-labelledby="heading-${chapterID}"
            data-bs-parent="#accordionContainer">
            <div class="accordion-body col-primary-dark">
              <div class="editor px-2"> </div>
            </div>
          </div>
      </div>
      `
			);

			let currentChapterTitle = document.getElementById(
					"chapter-accordion-" + chapterID
				),
				currentChapterTitleInput =
					currentChapterTitle.getElementsByTagName("input")[0];
			currentChapterTitleInput.focus();
			currentChapterTitleInput.click();
			currentChapterTitleInput.addEventListener("keyup", (event) => {
				if (event.keyCode === 13 || event.code === "Enter") {
					currentChapterTitleInput.setAttribute("disabled", true);
				}
			});

			lettersCount[lettersCount.length] = [chapterID, 0];

			window["chapterEditor" + chapterID] = new Quill(
				"#chapter-accordion-" + chapterID + " .editor",
				{
					modules: {
						toolbar: toolbarOptions,
					},
					theme: "snow",
				}
			);
			window["chapterEditor" + chapterID].on(
				"text-change",
				function (delta, oldDelta, source) {  
					let textLen = window["chapterEditor" + chapterID].getLength();              
					for(let i = 0; lettersCount.length > i; i++){
						if(lettersCount[i][0] == chapterID){
							lettersCount[i][1] = textLen;
							break; 
						}
					}
					calcChapters(lettersCount, true);
				}
			);

		} else {
			// desktop functionality.
			chapterList.insertAdjacentHTML(
				"beforeend",
				`  
      <div class="chapter-title" id="chapter-title-${chapterID}" data-chapter-num="${chapterID}">
        <div class="input_field">
            <div class="title d-flex flex-row-reverse">
              <input class="content w-100" placeholder="Add chapter title"/>
              <span class="chapterNumber">${chapterTitleCount+1}.</span>
            </div>
            <div class="icons">
              <i class="fa-solid fa-pen"></i>
              <i class="fa-solid fa-trash"></i>
            </div>
        </div>
        <div class="progressbar-back w-100">
            <div class="progressbar-val"></div>
        </div>
      </div>
      `
			);

			let currentChapterTitle = document.getElementById(
					"chapter-title-" + chapterID
				),
				currentChapterTitleInput =
					currentChapterTitle.getElementsByTagName("input")[0];
			currentChapterTitleInput.focus();
			currentChapterTitleInput.click();
			currentChapterTitleInput.addEventListener("keyup", (event) => {
				if (event.keyCode === 13 || event.code === "Enter") {
					currentChapterTitleInput.setAttribute("disabled", true);
				}
			});
			document.querySelectorAll(".chapter-title").forEach((e) => {
				e.classList.remove("active");
			});
			currentChapterTitle.classList.add("active");

			editorSection.querySelectorAll(".container").forEach((element) => {
				element.classList.add("d-none");
			});
			editorSection.insertAdjacentHTML(
				"beforeend",
				`
      <div class="container h-100" id="chapter-editor-${chapterID}">
        <div class="title">
          <h1>Add Chapter title</h1>
          <hr class="solid">
        </div>
        <div class="editor"></div>
      </div>
      `
			);

			lettersCount[lettersCount.length] = [chapterID, 0];

			window["chapterEditor" + chapterID] = new Quill(
				"#chapter-editor-" + chapterID + " .editor",
				{
					modules: {
						toolbar: toolbarOptions,
					},
					theme: "snow",
				}
			);
			window["chapterEditor" + chapterID].on(
				"text-change",
				function (delta, oldDelta, source) {
					let textLen = window["chapterEditor" + chapterID].getLength(),
						editorFullContent = document.querySelector(
							"#chapter-editor-" + chapterID + " .ql-editor"
						).innerHTML,
						previewContainer = document.querySelector(
							"#chapter-preview-" +
								chapterID +
								" .chapterPreviewContainer"
						),
						chapterTitle = document.querySelector(
							"#chapter-title-" + chapterID + " input"
						).value,
                        oldDOM = [];
                
                    previewContainer.querySelectorAll(".preview").forEach(e => {
                        let childrenLen = e.children.length, 
                            i = 0; 
                        if(childrenLen > 0){
                            for(i; childrenLen > i; i++){
                                oldDOM.push(e.children[i]); 
                            }
                        }
                    });

					previewContainer.innerHTML = "";
					appendChunksToPages(
						getNodeChunks(editorFullContent, oldDOM),
						previewContainer,
						chapterTitle
					);
					document.querySelectorAll(".chapter-pageNum").forEach((e, i) => {
						e.innerHTML = i + 1;
					});

					for(let i = 0; lettersCount.length > i; i++){
						if(lettersCount[i][0] == chapterID){
							lettersCount[i][1] = textLen;
							break; 
						}
					}
					calcChapters(lettersCount);
				}
			);

			chapterContainerElement.insertAdjacentHTML(
				"beforeend",
				`
      <div class="chapter" id="chapter-preview-${chapterID}">
          <div class="align-items-center chapter-page d-flex justify-content-center">
              <h1 class="chapterH1">Add Chapter Title</h1>
              <div class="chapter-pageNum text-center"></div>
          </div>
          <div class="chapterPreviewContainer"></div>
      </div>
      `
			);
		}
	});

	// sidebar interactions
	chapterList.addEventListener("click", function (e) {
		// delete btn
		if (e.target.matches(".fa-trash")) {
			if(!confirm("Are you sure you want to delete this chapter?")) {
				return;
			}
			let currentChapterTitle = e.target.closest(".chapter-title"),
				chapterNum = currentChapterTitle.getAttribute("data-chapter-num");
			currentChapterTitle.remove();
			document.getElementById("chapter-editor-" + chapterNum).remove();
			document.getElementById("chapter-preview-" + chapterNum).remove();

			let chapterEditor = document.querySelectorAll(
					".editor-section .container"
				);
			document.querySelectorAll(".chapter-title").forEach((e, i) => {
				let theNum = i + 1;
				e.querySelector(".chapterNumber").innerText = theNum + ".";

				if (theNum == 1) {
					e.classList.add("active");
					chapterEditor[0].classList.remove("d-none");
				} else {
					e.classList.remove("active");
					chapterEditor[i].classList.add("d-none");
				}
			});

			for(let i = 0; lettersCount.length > i; i++){
				if(lettersCount[i][0] == chapterNum){
					lettersCount.splice(i, 1);
					break; 
				}
			}
			calcChapters(lettersCount);

		}

		// edit btn
		if (e.target.matches(".fa-pen")) {
			let currentInput = e.target
				.closest(".input_field")
				.getElementsByTagName("input")[0];
			currentInput.removeAttribute("disabled");
			currentInput.focus();
		}

		// chapter input change
		if (e.target.matches(".chapter-title input")) {
			let $this = e.target,
				chapterNum = $this
					.closest(".chapter-title")
					.getAttribute("data-chapter-num");
			$this.addEventListener("keyup", function () {
				document.querySelector(
					"#chapter-editor-" + chapterNum + " h1"
				).innerText = this.value;
				document.querySelector(
					"#chapter-preview-" + chapterNum + " .chapterH1"
				).innerText = this.value;
			});

			$this.addEventListener("focusout", function () {
				this.setAttribute("disabled", true);
			});

			if ($this.hasAttribute("disabled")) {
				document.querySelectorAll(".editor-section .container").forEach((e) => {
					e.classList.add("d-none");
				});
				document.querySelectorAll(".chapter-title").forEach((e) => {
					e.classList.remove("active");
				});
				let currentClickedChapter = $this.closest(".chapter-title");
				currentClickedChapter.classList.add("active");
				document
					.querySelector(`#chapter-editor-${chapterNum}`)
					.classList.remove("d-none");
			}
		}

		// Accordion chapter title
		if (e.target.matches(".accordion-button")) {
			let $this = e.target;
			$this.addEventListener("focusout", function () {
				this.setAttribute("disabled", true);
			});
		}

	
	});

	let firstChapterTitleInput = document.querySelector(".chapter-title input");
	firstChapterTitleInput.addEventListener("keyup", (event) => {
		if (event.code === "Enter") {
			firstChapterTitleInput.setAttribute("disabled", true);
		}
	});

});




///////////////////////////////

function getNodeChunks(htmlDocument, oldDOM) {
	let offscreenDiv = document.querySelector("#js_offscreenPreview .preview");
	offscreenDiv.innerHTML = htmlDocument;
	offscreenRect = offscreenDiv.getBoundingClientRect();
	let chunks = [];
	let currentChunk = [];

        // check where to scroll 
		for (let i = 0; i < offscreenDiv.children.length; i++) {
		if(oldDOM.length > 0){
            if(oldDOM[i]){
                if(offscreenDiv.children[i].innerHTML != oldDOM[i].innerHTML){
                    offscreenDiv.children[i].id = "scrollToElement";
                }
            }
        }


	}

	for (let i = 0; i < offscreenDiv.children.length; i++) {

    
		let current = offscreenDiv.children[i];
		let currentRect = current.getBoundingClientRect();
		currentChunk.push(current);
		if (currentRect.bottom > offscreenRect.bottom) {
			// current element is overflowing offscreenDiv, remove it from current chunk
			currentChunk.pop();
			// remove all elements in currentChunk from offscreenDiv
			currentChunk.forEach((elem) => elem.remove());
			// since children were removed from offscreenDiv, adjust i to start back at current eleme on next iteration
			i -= currentChunk.length;
			// push current completed chunk to the resulting chunklist
			chunks.push(currentChunk);
			// initialise new current chunk
			currentChunk = [current];
			offscreenRect = offscreenDiv.getBoundingClientRect();
		}
	}
	// currentChunk may not be empty but we need the last elements
	if (currentChunk.length > 0) {
		currentChunk.forEach((elem) => elem.remove());
		chunks.push(currentChunk);
	}

	return chunks;
}

function appendChunksToPages(chunks, rootContainer, chapterTitle) {
	let container = rootContainer,
		i = 0;
	chunks.forEach((chunk) => {
		container.innerHTML += `
      <div class="chapter-page">
          <div class="chapter-header">${chapterTitle}</div>
          <div class="preview preview_${i}"> </div>
          <div class="chapter-pageNum text-center"> </div>
      </div>
      `;
		let content = container.querySelector(".preview_" + i);
		chunk.forEach((elem) => content.appendChild(elem));
		i++;
	});

    let scrollToElement = document.getElementById('scrollToElement');
    if(scrollToElement){
        scrollToElement.parentElement.parentElement.scrollIntoView({behavior:"smooth"});
    }else{
        container.scrollIntoView({block: "end"});
    }
}

function calcChapters(arr, mobile = false) {
	let max = 0;
	for(let i=0; arr.length > i; i++){
		if(arr[i][1] > max){
			max = arr[i][1]; 
		}
	}
	if(mobile == false){
		arr.forEach(e => {
			let len = (e[1] / max) * 100;
			document.querySelector(
				"#chapter-title-" + e[0] + " .progressbar-val"
			).style.width = len + "%";
		});
	}else{
		arr.forEach(e => {
			let len = (e[1] / max) * 100;
			document.querySelector(
				"#chapter-accordion-" + e[0] + " .progressbar-val"
			).style.width = len + "%";
		});
	}
}