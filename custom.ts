// (NEC) InfraRed receiver, experimental
// Version 30-04-2025
//    test code with
//    embedded library code
//    adopted for and tested with/on
//      KY-022, Grove - IR Receiver (TSOP384) and Calliope mini 3
//    additional debug messages/output
//
// Some of the library code is based on/derived from:
// MakeCode blocks for Infrared
// Original Code by 劉正吉 https://github.com/lioujj/pxt-IR
// MIT License
// Changes for Calliope Mini by M. Klein
//

//% weight=0 color=#87bc4b icon="\uf1eb" block="Infrarot IR"

const debugShowFirstPulses = 0
const debugShowPulseDuration = 0
const debugShowUniquePulses = 0
const tic = 160
namespace IR {
    const enum NEC {
        // (pulse) durations in microseconds
        startHigh = 9000, // protocol type encoding
        startLow = 4500,
        stopHigh = 560,   // end of message encoding
        stopLow = 0,      // actually low for longer than max of all nnnLow
        trueHigh = 560,   // bit 1 encoding
        trueLow = 1690,
        falseHigh = 560,  // bit 0 encoding
        falseLow = 560,
        interval = 110000 // for one message
    }

    let callBack: Action;
    let receiverStarted = false;
    let highLowDuration: number[] = []
    let received = false
    // let first = true
    let rec_Type = ""
    let messageStr = ""
    let recPin = DigitalPin.C16

    /**
     *  set the IR receiver pin.
     */
    //% blockId=setREC_pin block="Infrarotempfänger an Pin %myPin" blockExternalInputs=false
    //% weight=85 blockGap=10
    //% myPin.fieldEditor="gridpicker" myPin.fieldOptions.columns=4
    //% myPin.fieldOptions.tooltips="false" myPin.fieldOptions.width="300"
    export function setREC_pin(myPin: DigitalPin) {
        recPin = myPin;
        //        pins.setEvents(recPin, PinEventType.Pulse)
        //        pins.setPull(recPin, PinPullMode.PullUp)
        //        pins.onPulsed(recPin, PulseValue.Low, function () {
        //            highLowDuration.push(pins.pulseDuration())
        //        })
        //        pins.onPulsed(recPin, PulseValue.High, function () {
        //            highLowDuration.push(pins.pulseDuration())
        //        })

        receiverStarted = true;
        control.inBackground(function () {
            // Low, high pulse and duration detection
            // Version 28-04-2025
            // Note, only for more than one pulse within 4.5 ms (otherwise a
            //       [NEC] stop is detected) some low duration time will be
            //       printed;
            //
            // recPin: (digital) pin, global
            // tic: micro seconds
            // for the used IR receiver it seems if the Pin is low it received
            // a high pulse
            // mode: 0 == down => high pulse
            // 1 = up => low pulse
            // modeTics: tics per mode
            // highLowDuration: sequence of durations for observed pulses starting with first seen high pulse
            // Polling is used rather than events; this should not cause any
            // problem, because there is nothing else to be done, here.
            // 80 is a divisor of all NEC pulse durations.
            // 160 is a possible compromise that results in
            // closer to the expected NEC pulse durations.
            let modeTics: number[] = []
            // const tic = 80
            const minLowStop = Math.idiv(4500, tic)
            let mode
            let lastMode = PinPullMode.PullUp
            while (true) {
                modeTics = [0, 0]
                pins.setPull(recPin, lastMode)
                // wait for first high pulse
                // Again, here pin is up for low pulse, pin is down for high pulse.
                do {
                    mode = pins.digitalReadPin(recPin)
                    control.waitMicros(tic)
                } while (mode == lastMode)
                modeTics[mode] = 1
                lastMode = mode
                // Process tics until there are more than 8 NEC spaces (562.5 micro second
                // units); that is, pin is low for more than 4500 micro seconds;
                // for example, check for more than 90 tics of 50 micro seconds;
                // this low duration is not recorded.
                // Again, here pin is up for low pulse, pin is down for high pulse.
                while (true) {
                    mode = pins.digitalReadPin(recPin)
                    modeTics[mode]++
                    if (mode != lastMode) {
                        highLowDuration.push(modeTics[lastMode] * tic)
                        modeTics[lastMode] = 0
                        lastMode = mode
                    }
                    if (modeTics[PinPullMode.PullUp] > minLowStop) {
                        break;
                    }
                    control.waitMicros(tic)
                }
                received = true
                decodeIR();
            }
        })
    }

    function convertHexStrToNum(myMsg: string): number {
        let myNum = 0
        for (let i = 0; i < myMsg.length; i++) {
            if ((myMsg.charCodeAt(i) > 47) && (myMsg.charCodeAt(i) < 58)) {
                myNum += (myMsg.charCodeAt(i) - 48) * (16 ** (myMsg.length - 1 - i))
            } else if ((myMsg.charCodeAt(i) > 96) && (myMsg.charCodeAt(i) < 103)) {
                myNum += (myMsg.charCodeAt(i) - 87) * (16 ** (myMsg.length - 1 - i))
            } else if ((myMsg.charCodeAt(i) > 64) && (myMsg.charCodeAt(i) < 71)) {
                myNum += (myMsg.charCodeAt(i) - 55) * (16 ** (myMsg.length - 1 - i))
            } else {
                myNum = 0
                break
            }
        }
        return myNum
    }

    function resetReceiver() {
        highLowDuration = []
        received = false
    }

    function decodeIR() {
        let addr = 0
        let command = 0
        messageStr = ""
        rec_Type = ""
        if (debugShowFirstPulses) {
            // Show first ... high/low durations/intervals
            basic.setLedColors(0x00ff00, 0x000000, 0x000000)
            for (let i = 0; i < Math.min(2, highLowDuration.length); i++) {
                basic.showString("*", 200)
                basic.showNumber(highLowDuration[i])
            }
            basic.setLedColors(0x000000, 0x000000, 0x000000)
        }
        if (debugShowPulseDuration) {
            basic.setLedColors(0x000000, 0x00ff00, 0x000000)
            //  Show start duration, end duration and total duration
            //  // basic.showString("=", 400)
            //  // basic.showNumber(highLowDuration[0])
            //  // basic.showString("=", 400)
            //  // basic.showNumber(highLowDuration[highLowDuration.length-1])
            basic.showString("=", 400)
            let total = 0
            for (let i = 0; i < highLowDuration.length; i++) {
                total += highLowDuration[i]
            }
            basic.showNumber(total)
        }
        if (debugShowUniquePulses) {
            // Show all unique high/low durations/intervals
            let delta: number[] = []
            for (let i = 0; i < highLowDuration.length; i++) {
                let found = 0;
                for (let j = 0; j < delta.length; j++) {
                    if (delta[j] == highLowDuration[i]) {
                        found = 1;
                        break
                    }
                }
                if (found == 0) {
                    delta.push(highLowDuration[i])
                }
            }

            basic.setLedColors(0x000000, 0x000000, 0x00ff00)
            for (let i = 0; i < delta.length; i++) {
                basic.showString("|", 400)
                basic.showNumber(delta[i])
            }
        }
        basic.pause(200)
        let idelta = 500
        if (((highLowDuration[0] + highLowDuration[1]) > NEC.startHigh + NEC.startLow - idelta) && ((highLowDuration[0] + highLowDuration[1]) < NEC.startHigh + NEC.startLow + idelta)) {
            rec_Type = "NEC"
            highLowDuration.removeAt(1)
            highLowDuration.removeAt(0)
            addr = pulseToDigit(0, 15, 1600) // NEC.trueLow - 90 ?
            command = pulseToDigit(16, 31, 1600)
            messageStr = convertNumToHexStr(addr, 4) + convertNumToHexStr(command, 4)
        } else {
            rec_Type = "UNKNOWN"
        }
        if (callBack)
            callBack();
        resetReceiver();
    }

    function pulseToDigit(beginBit: number, endBit: number, duration: number): number {
        let myNum = 0
        for (let i = beginBit; i <= endBit; i++) {
            myNum <<= 1
            if ((highLowDuration[i * 2] + highLowDuration[i * 2 + 1]) < duration) {
                myNum += 0
            } else {
                myNum += 1
            }
        }
        return myNum
    }

    function convertNumToHexStr(myNum: number, digits: number): string {
        let tempDiv = 0
        let tempMod = 0
        let myStr = ""
        tempDiv = myNum
        while (tempDiv > 0) {
            tempMod = tempDiv % 16
            if (tempMod > 9) {
                myStr = String.fromCharCode(tempMod - 10 + 97) + myStr
            } else {
                myStr = tempMod + myStr
            }
            tempDiv = tempDiv >> 4
        }
        while (myStr.length != digits) {
            myStr = "0" + myStr
        }
        return myStr
    }

    /**
     * Do something when a receive IR
     */
    //% blockId=onReceivedIR block="wenn IR Code empfangen" blockInlineInputs=true
    //% weight=70 blockGap=10
    export function onReceivedIR(aFunction: Action): void {
        callBack = aFunction
    }

    /**
     * return the encoding type of the received IR 
     */
    //% blockId=getRecType block="die empfangene IR Codierung"
    //% weight=60 blockGap=10
    export function getRecType(): string {
        return rec_Type
    }

    /**
     * return the message of the received IR 
     */
    //% blockId=getMessage block="die empfangene IR Nachricht"
    //% weight=60 blockGap=10
    export function getMessage(): string {
        return messageStr
    }
}

