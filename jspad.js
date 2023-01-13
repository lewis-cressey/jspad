const EditSession = require("ace/edit_session").EditSession;
ace.config.set("basePath", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/")
const editSession = new EditSession("")
editSession.setMode(`ace/mode/javascript`)
editSession.setValue(localStorage.getItem("jspad.code") || "")
const editor = ace.edit("editor");
editor.setSession(editSession)
const filenameInput = document.getElementById("filename")
filenameInput.value = localStorage.getItem("jspad.filename") || "code.js"
const outputElement = document.getElementById("output")

function saveCode() {
	localStorage.setItem("jspad.filename", filenameInput.value)
	const code = editSession.getValue()
	localStorage.setItem("jspad.code", code)
	return code
}

/**********************************************************
 ** Functions available to the user code.                **
 **********************************************************/

function clear() {
	while (outputElement.firstChild) {
		outputElement.firstChild.remove()
	}
}

function print(...args) {
	const line = document.createElement("div")
	line.textContent = args.join(" ")
	outputElement.append(line)
	line.scrollIntoView()
	return line
}

window.clear = clear
window.print = print

/**********************************************************
 ** UI functions.                                        **
 **********************************************************/

document.querySelector("#run-button").addEventListener("click", event => {
	const code = saveCode()
	window.clear()
	try {
		const f = new Function(`(function usercode() {\n"use strict;"\n${code}\n}).call()\n`)
		f()
	} catch (err) {
		const lines = err.stack.split("\n")
		let line = lines[1]
		let lineNumber = 0
		const functionName = "<anonymous>"
		
		for (;;) {
			const index = line.indexOf(functionName)
			if (index < 0) break
			line = line.substring(index + functionName.length)
		}
		
		for (;;) {
			lineNumber = parseInt(line)
			if (lineNumber > 0) break
			line = line.substring(1)
		}
		
		const element = window.print(`Line ${lineNumber}: ${err}`)
		element.className = "error"
	}
})

document.querySelector("#save-button").addEventListener("click", event => {
    const code = saveCode()
	const filename = filenameInput.value.trim() || "code.js"
	
    const blob = new Blob([ code ], { type: "text/plain" })
	const link = document.getElementById("save-link")
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
})

document.querySelector("#load-file").addEventListener("change", event => {
    const reader = new FileReader()
    reader.onload = function() {
		const code = reader.result
        editSession.setValue(code)
		saveCode()
    }
    const files = event.target.files
	const file = files[0]
    if (file) {
		filenameInput.value = file.name
		reader.readAsText(file)
	}
})

document.querySelector("#load-button").addEventListener("click", event => {
    document.querySelector("#load-file").click()
})

