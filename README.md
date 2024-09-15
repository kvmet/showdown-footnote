# showdown-footnote

Footnote Formatting for Showdown

Inspired by https://github.com/halbgut/showdown-footnotes although this is a full rewrite. 

## Installation

- Include `showdown-footnote.js` script in your webpage.

```html
<script defer type="text/javascript" src="js/showdown-footnote.js"></script>
```

- Call `spoiler()` when you initialize the showdown converter.

```javascript
var converter = new showdown.Converter({
  extensions: [
    footnote(),
  ],
});
```

## Usage

### Footnote references

`[^footnotename]` can be placed anywhere in your text. If there is a valid definition present in the file, it will be converted into a footnote reference.
If there is a not a valid definition, then the reference is left unchanged.

### Footnote definitions

A colon is added after the reference in order to convert it into a definition.

```
[^footnotename]: Footnote definition
```

Multi-line, and formatted content is allowed:

```
[^2]: This is
    a multi-line definition
    > It can even
    > contain other types of markdown
```

