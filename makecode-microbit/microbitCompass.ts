namespace servers {
    // Service: Compass
    const SRV_COMPASS = 0x15b7b9bf
    const enum CompassReg {
        /**
         * Read-only ° u16.16 (uint32_t). The heading with respect to the magnetic north.
         *
         * ```
         * const [heading] = jdunpack<[number]>(buf, "u16.16")
         * ```
         */
        Heading = 0x101,

        /**
         * Read-write bool (uint8_t). Turn on or off the sensor. Turning on the sensor may start a calibration sequence.
         *
         * ```
         * const [enabled] = jdunpack<[number]>(buf, "u8")
         * ```
         */
        Enabled = 0x1,

        /**
         * Read-only ° u16.16 (uint32_t). Error on the heading reading
         *
         * ```
         * const [headingError] = jdunpack<[number]>(buf, "u16.16")
         * ```
         */
        HeadingError = 0x106,
    }

    const enum CompassCmd {
        /**
         * No args. Starts a calibration sequence for the compass.
         */
        Calibrate = 0x2,
    }

    export class CompassServer extends jacdac.SensorServer {
        enabled = false

        constructor() {
            super("compass", SRV_COMPASS)
        }

        public handlePacket(pkt: jacdac.JDPacket) {
            const oldEnabled = this.enabled
            this.enabled = this.handleRegBool(
                pkt,
                CompassReg.Enabled,
                this.enabled
            )
            this.handleRegValue(pkt, CompassReg.HeadingError, "u16.16", 2)

            // trigger calibration
            if (this.enabled && oldEnabled !== this.enabled)
                this.startCalibration()

            pkt.possiblyNotImplemented()
        }

        private startCalibration() {
            control.runInBackground(() => {
                input.compassHeading()
            })
        }

        protected handleCalibrateCommand(pkt: jacdac.JDPacket) {
            if (this.enabled) this.startCalibration()
        }

        public serializeState(): Buffer {
            const heading = this.enabled ? input.compassHeading() : 0
            return jacdac.jdpack("u16.16", [heading])
        }
    }

    //% fixedInstance whenUsed block="compass"
    export const compassServer = new CompassServer()
}
