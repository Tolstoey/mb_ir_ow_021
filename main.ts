// ahem, main ...
IR.onReceivedIR(function () {
    oledssd1306.clearDisplay()
    basic.setLedColors(0x00ff00, 0x00ff00, 0x00ff00)
    oledssd1306.writeString(IR.getRecType())
    oledssd1306.writeString(IR.getMessage())
})
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
	
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
	
})
input.onGesture(Gesture.Shake, function () {
    oledssd1306.clearDisplay()
})
oledssd1306.initDisplay()
basic.setLedColors(0xff0000, 0xff0000, 0xff0000)
basic.pause(500)
IR.setREC_pin(
DigitalPin.C16
)
basic.forever(function () {
    basic.pause(1000)
    basic.setLedColors(0x000000, 0x000000, 0x00ff00)
})
