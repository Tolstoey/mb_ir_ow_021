function Seite_zurueckblaettern () {
    for (let Index = 0; Index <= Zeilen_pro_Seite; Index++) {
        schreibe_Zellinhalt_in_Zeile((aktuelle_Seitenzahl - 2) * Zeilen_pro_Seite + Index, Index)
    }
    aktuelle_Seitenzahl += -1
    nextFreeLine = 0
}
// ahem, main ...
IR.onReceivedIR(function () {
    basic.setLedColors(0x00ff00, 0x00ff00, 0x00ff00)
    textCodeListe[Zelle] = IR.getRecType()
    textEmpfangListe[Zelle] = IR.getMessage()
    schreibe_Zellinhalt_in_Zeile(Zelle, nextFreeLine)
    Zelle += 1
})
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    Seite_zurueckblaettern()
})
function Seite_weiterblaettern () {
    oledssd1306.clearDisplay()
    for (let Index = 0; Index <= Zeilen_pro_Seite - 1; Index++) {
        schreibe_Zellinhalt_in_Zeile(aktuelle_Seitenzahl * Zeilen_pro_Seite + Index, Index)
    }
    aktuelle_Seitenzahl += 1
    nextFreeLine = 0
}
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    Seite_weiterblaettern()
})
// Aufruf: Speicherstelle und Zeile, in die geschrieben werden soll angeben. Wenn Display voll ist, wird vor dem schreiben Display gelöscht und in oberste Zeile geschrieben
function schreibe_Zellinhalt_in_Zeile (ZelleX: number, ZeileX: number) {
    if (nextFreeLine == 0) {
        oledssd1306.clearDisplay()
        nextFreeLine += 1
    } else {
        if (nextFreeLine < 7) {
            nextFreeLine += 1
        } else {
            nextFreeLine = 0
        }
    }
    oledssd1306.setTextXY(ZeileX, 0)
    oledssd1306.writeNumber(ZelleX)
    oledssd1306.setTextXY(ZeileX, 3)
    oledssd1306.writeString(textCodeListe[ZelleX])
    oledssd1306.setTextXY(ZeileX, 8)
    oledssd1306.writeString(textEmpfangListe[ZelleX])
}
let Zelle = 0
let textEmpfangListe: string[] = []
let textCodeListe: string[] = []
let nextFreeLine = 0
let aktuelle_Seitenzahl = 0
let Zeilen_pro_Seite = 0
Zeilen_pro_Seite = 8
aktuelle_Seitenzahl = 1
nextFreeLine = 0
oledssd1306.initDisplay()
textCodeListe = [""]
textEmpfangListe = [""]
Zelle = 0
basic.setLedColors(0xff0000, 0xff0000, 0xff0000)
basic.pause(500)
IR.setREC_pin(
DigitalPin.C16
)
basic.forever(function () {
    basic.pause(1000)
    basic.setLedColors(0x000000, 0x000000, 0x00ff00)
})
