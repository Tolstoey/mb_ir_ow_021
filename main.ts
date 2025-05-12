// ahem, main ...
IR.onReceivedIR(function () {
    basic.setLedColors(0x00ff00, 0x00ff00, 0x00ff00)
    textCodeListe[Zeile] = IR.getRecType()
    textEmpfangListe[Zeile] = IR.getMessage()
    oledssd1306.setTextXY(Zeile, 0)
    oledssd1306.writeString(textCodeListe[Zeile])
    oledssd1306.setTextXY(Zeile, 6)
    oledssd1306.writeString(textEmpfangListe[Zeile])
    if (Zeile < 4) {
        Zeile += 1
    } else {
        Zeile = 0
        oledssd1306.clearDisplay()
    }
})
let Zeile = 0
let textEmpfangListe: string[] = []
let textCodeListe: string[] = []
oledssd1306.initDisplay()
textCodeListe = [""]
textEmpfangListe = [""]
Zeile = 0
basic.setLedColors(0xff0000, 0xff0000, 0xff0000)
basic.pause(500)
IR.setREC_pin(
DigitalPin.C16
)
basic.forever(function () {
    basic.pause(1000)
    basic.setLedColors(0x000000, 0x000000, 0x00ff00)
})
