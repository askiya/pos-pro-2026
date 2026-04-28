export class EscPosEncoder {
  private buffer: number[] = [];
  // Default to 58mm printer (usually 32 characters per line)
  private charsPerLine = 32;

  constructor(charsPerLine: 32 | 48 = 32) {
    this.charsPerLine = charsPerLine;
  }

  // Initialize printer
  init() {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  // Character encoding (basic ASCII/UTF-8 workaround)
  private encodeString(text: string): number[] {
    // For a real production app with non-ASCII characters,
    // you might need TextEncoder + iconv-lite for CP858 or CP860.
    // For standard POS receipts in Indonesia, basic TextEncoder works fine.
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(text));
  }

  // Raw text
  text(text: string) {
    this.buffer.push(...this.encodeString(text));
    return this;
  }

  // Text + Newline
  line(text: string = "") {
    this.text(text);
    this.newline();
    return this;
  }

  // Newline
  newline() {
    this.buffer.push(0x0a);
    return this;
  }

  // Feed n lines
  feed(n: number = 1) {
    for (let i = 0; i < n; i++) {
      this.newline();
    }
    return this;
  }

  // Alignments
  alignLeft() {
    this.buffer.push(0x1b, 0x61, 0x00);
    return this;
  }

  alignCenter() {
    this.buffer.push(0x1b, 0x61, 0x01);
    return this;
  }

  alignRight() {
    this.buffer.push(0x1b, 0x61, 0x02);
    return this;
  }

  // Text Styles
  bold(on: boolean = true) {
    this.buffer.push(0x1b, 0x45, on ? 0x01 : 0x00);
    return this;
  }

  size(width: 1 | 2 = 1, height: 1 | 2 = 1) {
    const widthHex = width === 2 ? 0x10 : 0x00;
    const heightHex = height === 2 ? 0x01 : 0x00;
    this.buffer.push(0x1d, 0x21, widthHex | heightHex);
    return this;
  }

  // Divider (------)
  divider(char: "-" | "=" = "-") {
    this.line(char.repeat(this.charsPerLine));
    return this;
  }

  // Key-Value Pair (e.g. "Total      Rp 10.000")
  tableRow(key: string, value: string) {
    const keyStr = String(key);
    const valStr = String(value);
    
    // Calculate spaces needed
    const totalLength = keyStr.length + valStr.length;
    let spaces = this.charsPerLine - totalLength;
    
    // If it exceeds line length, we just put one space
    if (spaces < 1) spaces = 1;

    this.line(`${keyStr}${" ".repeat(spaces)}${valStr}`);
    return this;
  }

  // Cut Paper
  cut() {
    // Hex: 1D 56 41 10 (GS V A 16)
    this.buffer.push(0x1d, 0x56, 0x41, 0x10);
    return this;
  }

  // Cash Drawer Kick
  openDrawer() {
    // Hex: 1B 70 00 19 FA (ESC p 0 25 250)
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    return this;
  }

  // Build the final Uint8Array to send to printer
  build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
