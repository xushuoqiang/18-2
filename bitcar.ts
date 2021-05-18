/*****************************************************************************
* | Description :	BitCar extension for micro:bit
* | Developer   :   CH Makered
* | More Info   :	http://chmakered.com/
******************************************************************************/
enum GrovePin {
    //% block="P0"
    P0 = DigitalPin.P0,
    //% block="P1"
    P1 = DigitalPin.P1,
    //% block="P2"
    P2 = DigitalPin.P2,
    //% block="P8"
    P8 = DigitalPin.P8,
    //% block="P12"
    P12 = DigitalPin.P12,
    //% block="P16"
    P16 = DigitalPin.P16

    //% block="μs"
    MicroSeconds,
    //% block="cm"
    Centimeters,
    //% block="inches"
    Inches
}

enum GroveAnalogPin {
    //% block="P0"
    P0 = AnalogPin.P0,
    //% block="P1"
    P1 = AnalogPin.P1,
    //% block="P2"
    P2 = AnalogPin.P2
}

enum DistanceUnit {
    //% block="cm"
    cm,
    //% block="inch"
    inch
}

enum trick {
    //% block="arise"
    getUp,
    //% block=" +left"
    L_forward = AnalogPin.P14,
    //% block=" -right"
    R_backward = AnalogPin.P15,
    //% block=" +right"
    R_forward = AnalogPin.P16,
}

enum IRLineSensor {
    //% block="left sensor"
    left,
    //% block=" right sensor"
    right
}

/**
 * Provides access to BitCar blocks for micro: bit functionality.
 */
//% color=190 icon="\uf126" block= "BitCar"
//% groups="['BitCar Control', 'Sensors']"
namespace BitCar {

    let L_backward = AnalogPin.P13;
    let L_forward = AnalogPin.P14;
    let R_forward = AnalogPin.P15; 
    let R_backward = AnalogPin.P16;

    /**
    * Set the motors' speed of BitCar
    */
    //% blockId=move
    //% block="BitCar: left motor $left \\%, right motor$right \\%"
    //% left.shadow="speedPicker"
    //% right.shadow="speedPicker"
    //% group="BitCar Control"
    //% weight=100
    export function move(left: number, right: number) {
        if (left >= 0) {
            pins.analogWritePin(L_backward, 0);
            pins.analogWritePin(L_forward, Math.map(left, 0, 100, 0, 1023));
        } else if (left < 0) {
            pins.analogWritePin(L_backward, Math.map(Math.abs(left), 0, 100, 0, 1023));
            pins.analogWritePin(L_forward, 0);
        }
        if (right >= 0) {
            pins.analogWritePin(R_backward, 0);
            pins.analogWritePin(R_forward, Math.map(right, 0, 100, 0, 1023));
        } else if (right < 0) {
            pins.analogWritePin(R_backward, Math.map(Math.abs(right), 0, 100, 0, 1023));
            pins.analogWritePin(R_forward, 0);
        }
    }

    /**
    * BitCar stop
    */
    //% blockId=stop
    //% block="BitCar: stop"
    //% group="BitCar Control"
    //% weight=99
    //% blockGap=40
    export function stop() {
        pins.analogWritePin(L_backward, 0);
        pins.analogWritePin(L_forward, 0);
        pins.analogWritePin(R_backward, 0);
        pins.analogWritePin(R_forward, 0);
    }

    /**
    * When BitCar is still, make it stand up from the ground and then stop, try to tweak the motor speed and the charge time if it failed to do so
    */
    //% blockId=standup_still
    //% block="BitCar: stand up with speed $speed \\% charge$charge|(ms)"
    //% speed.defl=100
    //% speed.min=0 speed.max=100
    //% charge.defl=250
    //% group="BitCar Control"
    //% weight=98
    //% blockGap=40
    export function standup_still(speed: number, charge: number) {
        move(-speed, -speed);
        basic.pause(200);
        move(speed, speed);
        basic.pause(charge);
        stop();
    }


    /**
    * Check the state of the IR line sensor, the LED indicator is ON if the line is detected by the corresponding sensor
    */
    //% blockId=linesensor
    //% block="BitCar: line under $sensor|"
    //% group="BitCar Control"
    //% weight=97
    export function linesensor(sensor: IRLineSensor): boolean {
        let result: boolean = false;

        if (sensor == IRLineSensor.left) {
            if (pins.analogReadPin(AnalogPin.P1) < 500) {
                result = true;
            }
        } else if (sensor == IRLineSensor.right) {
            if (pins.analogReadPin(AnalogPin.P2) < 500) {
                result = true;
            }
        }
        return result;
    }

    /**
    * Line following at a specified speed.
    */
    //% blockId=linefollow
    //% block="BitCar: follow line at speed $speed \\%"
    //% speed.defl=50
    //% speed.min=0 speed.max=100
    //% group="BitCar Control"
    //% weight=96
    export function linefollow(speed: number) {
        if (linesensor(IRLineSensor.left) && linesensor(IRLineSensor.right)) {
            move(speed, speed);
        } else {
            if (!(linesensor(IRLineSensor.left)) && linesensor(IRLineSensor.right)) {
                move(speed, 0);
                if (!(linesensor(IRLineSensor.left)) && !(linesensor(IRLineSensor.right))) {
                    move(speed, 0);
                }
            } else {
                if (!(linesensor(IRLineSensor.right)) && linesensor(IRLineSensor.left)) {
                    move(0, speed);
                    if (!(linesensor(IRLineSensor.left)) && !(linesensor(IRLineSensor.right))) {
                        move(0, speed);
                    }
                }
            }
        }
    }

    /**
    * Get the distance from Grove-Ultrasonic Sensor, the measuring range is between 2-350cm
    */
    //% blockId=grove_ultrasonic
    //% block="Ultrasonic Sensor $groveport|: distance in $Unit"
    //% group="Sensors"
    //% weight=100
    export function grove_ultrasonic(groveport: GrovePin, Unit: DistanceUnit): number {
        let duration = 0;
        let distance = 0;
        let port: number = groveport;

        pins.digitalWritePin(<DigitalPin>port, 0);
        control.waitMicros(2);
        pins.digitalWritePin(<DigitalPin>port, 1);
        control.waitMicros(10);
        pins.digitalWritePin(<DigitalPin>port, 0);

        duration = pins.pulseIn(<DigitalPin>port, PulseValue.High, 50000);

        if (Unit == DistanceUnit.cm) distance = duration * 153 / 58 / 100;
        else distance = duration * 153 / 148 / 100;
        basic.pause(50);
        if (distance > 0) return Math.floor(distance * 10) / 10;
        else return 350;
    }
    /**
    * Get the distance from Grove-Ultrasonic Sensor, the measuring range is between 2-350cm
    */
    //% blockId=grove_ultrasonic_v2
    //% block="(V2)Ultrasonic Sensor $groveport|: distance in $Unit"
    //% group="Sensors"
    //% weight=99
    export function grove_ultrasonic_v2(groveport: GrovePin, Unit: DistanceUnit): number {
        let duration = 0;
        let distance = 0;
        let port: number = groveport;

        pins.digitalWritePin(<DigitalPin>port, 0);
        control.waitMicros(2);
        pins.digitalWritePin(<DigitalPin>port, 1);
        control.waitMicros(10);
        pins.digitalWritePin(<DigitalPin>port, 0);

        duration = pins.pulseIn(<DigitalPin>port, PulseValue.High, 50000);

        if (Unit == DistanceUnit.cm) distance = duration * 153 / 88 / 100;
        else distance = duration * 153 / 226 / 100;
        basic.pause(50);
        if (distance > 0) return Math.floor(distance * 10) / 10;
        else return 350;
    }
/**
 * Sonar and ping utilities
 */
//% color="#2c3e50" weight=10
namespace sonar {
    /**
     * Send a ping and get the echo time (in microseconds) as a result
     * @param trig tigger pin
     * @param echo echo pin
     * @param unit desired conversion unit
     * @param maxCmDistance maximum distance in centimeters (default is 500)
     */
    //% blockId=sonar_ping block="ping trig %trig|echo %echo|unit %unit"
    export function ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.Centimeters: return Math.idiv(d, 58);
            case PingUnit.Inches: return Math.idiv(d, 148);
            default: return d ;
        }
    }
}
}
