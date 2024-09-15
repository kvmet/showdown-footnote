// showdown-footnote
//
// copyright 2024 kvmet (Kristen Metcalfe)
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights 
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software. 
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS 
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

'use strict';

const footnote = function() {
  const footnotes = {};
  const subscriptLetters = 'abcdefghijklmnopqrstuvwxyz';

  // Helper function to remove indentation from multi-line content
  const removeIndent = (content) => {
    const lines = content.split('\n');
    if (lines.length <= 1) return content;
    
    // Measure indentation of the first and second lines
    const firstLineIndent = lines[0].match(/^\s*/)[0].length;
    const secondLineIndent = lines[1].match(/^\s*/)[0].length;
    
    // Calculate the difference in indentation
    const indentDifference = Math.max(0, secondLineIndent - firstLineIndent);
    
    // Remove the difference in indentation from the second line onwards
    return [
      lines[0],
      ...lines.slice(1).map(line => line.slice(indentDifference))
    ].join('\n');
  };

  return [
    {
      type: 'lang',
      filter: function(text) {
        const regexDefinition = /\[\^([\d\w]+)\]:\s*([\s\S]+?)(?=\n{2,}|\Z|\[\^)/gm;
        const placeholderPrefix = "FOOTNOTE_DEF_START_";
        const placeholderSuffix = "FOOTNOTE_DEF_END";

        // Initialize footnote object
        footnotes.clear = () => {
          for (const key in footnotes) {
            if (key !== 'clear') {
              delete footnotes[key];
            }
          }
        };
        footnotes.clear();

        // Process footnote definitions
        text = text.replace(regexDefinition, (match, id, content) => {
          const trimmedContent = removeIndent(content.trim());
          footnotes[id] = { count: 0, refs: [], content: trimmedContent };
          return `\n<!--${placeholderPrefix}${id}-->\n${trimmedContent}\n<!--${placeholderSuffix}-->\n`;
        });

        return text;
      }
    },
    {
      type: 'output',
      filter: function(text) {
        const regexReference = /\[\^([\d\w]+)\](?!:)/g;
        const regexPlaceholder = /<!--FOOTNOTE_DEF_START_([\d\w]+)-->([\s\S]*?)<!--FOOTNOTE_DEF_END-->/g;

        // Function to generate unique IDs for multiple references
        const generateId = (id, count) => `footnote-${id}-${count}`;

        // Process footnote references
        text = text.replace(regexReference, (match, id) => {
          if (!footnotes[id]) {
            return match; // Return the original reference if no definition exists
          }
          const uniqueId = generateId(id, ++footnotes[id].count);
          footnotes[id].refs.push({ id: uniqueId });
          const subscript = subscriptLetters[footnotes[id].refs.length - 1];
          return `<a class="footnote-reference" href="#footnote-def-${id}" id="${uniqueId}"><sup>${id}<sub>${subscript}</sub></sup></a>`;
        });

        // Process footnote definitions
        text = text.replace(regexPlaceholder, (match, id, content) => {
          const backLinks = footnotes[id].refs.map(
            (ref, index) => `<a href="#${ref.id}" class="footnote-backref">↩${subscriptLetters[index]}</a>`
          ).join(' ');

          return `
            <div class="footnote" id="footnote-def-${id}">
              <div class="footnote-header">
                <sup>${id}:</sup>
                <span class="footnote-backlinks">${backLinks}</span>
              </div>
              <div class="footnote-content">${content.trim()}</div>
            </div>`;
        });

        return text;
      }
    }
  ];
};

const style = document.createElement('style');
style.innerHTML = `
  .footnote {
    margin-top: 0.5em;
    font-size: 0.9em;
  }
  .footnote-header {
    display: flex;
    align-items: center;
  }
  .footnote-header sup {
    margin-right: 0.25em;
  }
  .footnote-backlinks {
    font-size: 0.8em;
    color: #555;
    margin-left: 0.5em;
  }
  .footnote-content {
    margin-left: 1.5em;
  }
  .footnote-reference {
    text-decoration: none;
  }
  .footnote-backref {
    margin-left: 0.25em;
    text-decoration: none;
  }
  sub {
    font-size: 70%;
    vertical-align: sub;
  }
`;
document.head.appendChild(style);

if (typeof showdown !== 'undefined' && showdown.extension) {
  showdown.extension('footnote', footnote);
}
