
/*
 hicbit_control package
*/
//% weight=10 icon="\uf2c5" color=#7CCD7C
namespace hicbit_control {

    export let sn: number = 0;
    export let NEW_LINE = "\r\n";
    export let Init_flag: number = 0xFF;
    export let Port_A: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    export let Port_B: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    export let Port_C: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    export let Port_D: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    export enum hicbit_key {
        //% block="up"
        up = 0x01,
        //% block="down"
        down = 0x02,
        //% block="left"
        left = 0x03,
        //% block="right"
        right = 0x04
    }
    
    /**
     * hicbit initialization, please execute at boot time
    */
    //% weight=100 blockGap=20 blockId=hicbit_Init block="Initialize hicbit"
    export function hicbit_Init() {

        led.enable(false);

        serial.redirect(
            SerialPin.P8,
            SerialPin.P12,
            BaudRate.BaudRate115200);
        
        serial.setRxBufferSize(64);

        basic.forever(() => {
            getHandleCmd();
        });

        while (Init_flag > 0) {
            if (Init_flag > 0) {    //查询命令
                QueryCMD();
            }
            basic.pause(2000);
        }

        basic.pause(1000);
    }

     
    /**
    * Get the handle command.
    */
    function getHandleCmd() {
        let flag: number = -1; 
        let j: number = 0; 
        let handleCmd: string = serial.readString();
        serial.writeString(handleCmd);
        if (handleCmd.charAt(0).compare("F") == 0) {
            if (handleCmd.charAt(1).compare("C") == 0)
                if (handleCmd.charAt(2).compare("F") == 0)
                    if (handleCmd.charAt(3).compare("C") == 0)
                        flag = 1;
        }
        if (flag != -1) {
            let index = strToNumber(handleCmd.substr(4, 2));        //Get the length
            // serial.writeString(index.toString());
            // serial.writeString(NEW_LINE);
            let cmd: string = handleCmd.substr(0, index * 2 + 6);   //Get all fields
            // serial.writeString(cmd);
            // serial.writeString(NEW_LINE);
            for (let i = 0; i < index * 2 + 4; i += 2) {
                // serial.writeString(strToNumber(cmd.substr(i, 2)).toString());
                // serial.writeString(NEW_LINE);
                j = j + strToNumber(cmd.substr(i, 2));    
            }
            // serial.writeString(j.toString());
            // serial.writeString(NEW_LINE);
            if (strToNumber(cmd.substr(index * 2 + 4, 2)) == (j & 0xFF) && j != 0) {
                // serial.writeString("Ture");
                let cmd_code = strToNumber(handleCmd.substr(8, 2));     //cmd_code
                let flag_code = strToNumber(handleCmd.substr(10, 2));    //flag/Numbering
                if (cmd_code == 0x02) {
                    Init_flag=flag_code;
                }
                if (cmd_code == 0xC1) {
                    let value1: number = strToNumber(handleCmd.substr(14, 4));      //value1
                    let value2: number = strToNumber(handleCmd.substr(18, 4))/10;      //value2(Y轴数值*10)
                    let value3: number = strToNumber(handleCmd.substr(22, 4))/10;      //value3(Z轴数值*10)
                    
                    if (flag_code == 8 || flag_code == 9)
                        value1 = value1 / 10;       //(X轴数值/10/距离/10)
                    switch (strToNumber(handleCmd.substr(12, 2)))    //Port_num
                    {
                        case 1:
                            Port_A[flag_code] = value1;
                            Port_A[10] = value2;
                            Port_A[11] = value3;
                            break;
                        case 2:
                            Port_B[flag_code] = value1;
                            Port_B[10] = value2;
                            Port_B[11] = value3;
                            break;
                        case 3:
                            Port_C[flag_code] = value1;
                            Port_C[10] = value2;
                            Port_C[11] = value3;
                            break;
                        case 4:
                            Port_D[flag_code] = value1;
                            Port_D[10] = value2;
                            Port_D[11] = value3;
                            break;
                    }
                }
                
            }
            else if (strToNumber(cmd.substr(index * 2 + 4, 2)) != (j & 0xFF) && j!= 0) {
                // serial.writeString("Flase");
                // serial.writeString(handleCmd);
                // serial.writeString(NEW_LINE);
                // serial.writeString(cmd.substr(index * 2 + 4, 2));
                // serial.writeString(NEW_LINE);
                // serial.writeString(NEW_LINE);
                // serial.writeString((j & 0xFF).toString());
                // serial.writeString(NEW_LINE);
                // if (strToNumber(cmd.substr(index * 2 + 4, 2)) != (j & 0xFF)) {
                //     serial.writeString("test Flase");
                //     serial.writeString(NEW_LINE);
                // }
                
            }
        }

        handleCmd = "";
    }

    function findIndexof(src: string, strFind: string, startIndex: number): number {
        for (let i = startIndex; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                return i;
            }
        }
        return -1;
    }
    
    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 16;
            num += tmp;
        }
        return num;
    }

    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;
        }
        else
            return -1;
    }

    /**
    * Query command.
    */
    function QueryCMD() {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(7);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x04;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0x01;                      //CMD
        buf[5] = 0x00;
        for (let i = 0; i < 6; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[6] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);
    }

    /**
    * array Initailzit.
    */
   export function arrayInit(): void {
        Port_A= [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        Port_B= [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        Port_C= [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        Port_D= [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    /**
    * Get message increment code(sn).
    */
   export function getsncode() {
        if (sn >= 0xff)
            sn = 0;
        return sn++;
    }

    /**
     * Pause for the specified time in seconds
     * @param s how long to pause for, eg: 1, 2, 5, 10, 20,
     */
    //% weight=90
    //% block="wait(s) %s"
    //% blockId=wait_s
    export function wait_s(s:number) {
        basic.pause(s*1000);
    }

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500
     */
    //% weight=89
    //% block="wait(ms) %ms"
    //% blockId=wait_ms
    export function wait_ms(ms:number) {
        basic.pause(ms);
    }

}



/*
 hicbit package
*/
//% weight=9 icon="\uf180" color=#5F9EA0
namespace hicbit {

    export let NEW_LINE = "\r\n";

    export enum hicbit_Port {
        //% block="port A"
        port1 = 0x01,
        //% block="port B"
        port2 = 0x02,
        //% block="port C"
        port3 = 0x03,
        //% block="Port D"
        port4 = 0x04
    }

    export enum hicbit_Features {
        //% block="start_up"
        start_up = 0x01,
        //% block="time(s)"
        time = 0x02,
        //% block="number_of_turns"
        number_of_turns = 0x03,
        //% block="angle"
        angle = 0x04,
        
    }

    export enum motor_type {
        //% block="Small_motor"
        Small_motor = 0x01,
        //% block="Medium_motor"
        Medium_motor = 0x02,
        //% block="Large_motor"
        Large_motor = 0x03,
        //% block="Encoding_motor"
        Encoding_motor = 0x04,
    }

    export enum motor_Turn {
        //% block="Forward"
        Forward = 0x01,
        //% block="Reverse"
        Reverse = 0x02,
    }

    /**
        * Motor Init
        */
    //% weight=100 blockId=MotorInit block="Init |%port |%motor "
    export function MotorInit(port: hicbit_Port, motor: motor_type): void {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(8);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x05;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xA0;                      //CMD
        buf[5] = motor;
        buf[6] = port;
        for (let i = 0; i < 7; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[7] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
       
    }

    /**
    *	Set interface motor speed , that can control turn.etc.
    */
    //% weight=99 blockId=set_Single_motor block="Set |%port |%Motortype |%Turn_TO |speed：%speed |Features %Features|: |%Content|"
    //% speed.min=0 speed.max=65535 
    //% inlineInputMode=inline
    export function set_Single_motor(port: hicbit_Port, Motortype: motor_type, Turn_TO: motor_Turn, speed: number, Features: hicbit_Features, Content: number) {
        let Check_Digit: number = 0;
        let content: number[];
        content[Features] = Content;
        let buf = pins.createBuffer(18);

        if (speed > 65535 || speed < 0) {
            return;
        }

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x0F;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xA1;                      //CMD
        buf[5] = Motortype;
        buf[6] = Features;
        buf[7] = Turn_TO;
        buf[8] = (speed & 0xFF00) >> 8;
        buf[9] = (speed & 0xFF);
        buf[10] = (content[2] & 0xFF00) >> 8;
        buf[11] = (content[2] & 0xFF);
        buf[12] = (content[3] & 0xFF00) >> 8;
        buf[13] = (content[3] & 0xFF);
        buf[14] = (content[4] & 0xFF00) >> 8;
        buf[15] = (content[4] & 0xFF);
        buf[16] = port;
        for (let i = 0; i < 17; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[17] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);
        
        basic.pause(500);
    }

    /**
        * Single Motor Stop
        */
    //% weight=98 blockId=SingleMotorStop block="Single |%port |%motor stop"
    //% inlineInputMode=inline
    export function SingleMotorStop(port: hicbit_Port, motor: motor_type): void {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(8);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x05;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xA2;                      //CMD
        buf[5] = motor;
        buf[6] = port;
        for (let i = 0; i < 7; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[7] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
       
    }

    /**
    *	Set interface motor1 and motor2 speed , range of -255~255, that can control turn.etc.
    *   @param port1 First port, eg: hicbit.hicbit_Port.port1
    *   @param port2 The second port, eg: hicbit.hicbit_Port.port2
    */
    //% weight=97 blockId=set_Dual_motor block="Set|%port1 |%Motortype1 |%Turn_TO1 speed|%speed1|和|%port2 |%Motortype2 |%Turn_TO2 speed|%speed2| Features|%Features|:|%Content|""
    //% speed1.min=0 speed1.max=65535 
    //% speed2.min=0 speed2.max=65535 
    //% inlineInputMode=inline
    export function set_Dual_motor(port1: hicbit_Port, Motortype1: motor_type, Turn_TO1: motor_Turn, speed1: number, port2: hicbit_Port, Motortype2: motor_type, Turn_TO2: motor_Turn, speed2: number, Features: hicbit_Features, Content: number) {
        let Check_Digit: number = 0;
        let content: number[];
        content[Features] = Content;
        let buf = pins.createBuffer(23);
        
        if (speed1 > 65535 || speed1 < 0)
            return;
        if (speed2 > 65535 || speed2 < 0)
            return;

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x14;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xA3;                      //CMD
        buf[5] = Motortype1;
        buf[6] = Motortype2;
        buf[7] = Features;
        buf[8] = Turn_TO1;
        buf[9] = Turn_TO2;
        buf[10] = (speed1 & 0xFF00) >> 8;
        buf[11] = (speed1 & 0xFF);
        buf[12] = (speed2 & 0xFF00) >> 8;
        buf[13] = (speed2 & 0xFF);
        buf[14] = (content[2] & 0xFF00) >> 8;
        buf[15] = (content[2] & 0xFF);
        buf[16] = (content[3] & 0xFF00) >> 8;
        buf[17] = (content[3] & 0xFF);
        buf[18] = (content[4] & 0xFF00) >> 8;
        buf[19] = (content[4] & 0xFF);
        buf[20] = port1;
        buf[21] = port2;
        for (let i = 0; i < 22; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[22] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);
        
        basic.pause(500);
    }
    
    /**
        * Dual Motor Stop
        * @param port1 First port, eg: hicbit.hicbit_Port.port1
        * @param port2 The second port, eg: hicbit.hicbit_Port.port2
        */
    //% weight=96 blockId=DualMotorStop block="Dual |%port1 |%motor1 and |%port2 |%motor2 stop"
    //% inlineInputMode=inline
    export function DualMotorStop(port1: hicbit_Port, motor1: motor_type, port2: hicbit_Port, motor2: motor_type): void {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(10);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x07;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xA4;                      //CMD
        buf[5] = motor1;
        buf[6] = motor2;
        buf[7] = port1;
        buf[8] = port2;
        for (let i = 0; i < 9; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[9] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
       
    }

}

/*
 Sensor package
*/
//% weight=8 icon="\uf2db" color=#8470FF
namespace Sensor {
    
    export enum hicbit_Port {
        //% block="port 1"
        port1 = 0x01,
        //% block="port 2"
        port2 = 0x02,
        //% block="port 3"
        port3 = 0x03,
        //% block="Port 4"
        port4 = 0x04
    }

    export enum Sensor_type {
        //% block="photosensitive"
        photosensitive = 0x01,
        //% block="collisionsensor"
        collisionsensor = 0x02,
        //% block="avoidSensor"
        avoidSensor = 0x03,
        //% block="ColorSensor"
        ColorSensor = 0x04,
        //% block="Soundsensor"
        Soundsensor = 0x05,
        //% block="Temperature_and_humidity_sensor"
        Temperature_and_humidity_sensor = 0x06,
        //% block="lineSensor"
        lineSensor = 0x07,
        //% block="ultrasonic"
        ultrasonic = 0x08,
        //% block="GyroscopGe_X"
        GyroscopGe_X = 0x09,
        //% block="GyroscopGe_Y"
        GyroscopGe_Y = 0x10,
        //% block="GyroscopGe_Z"
        GyroscopGe_Z = 0x11,
    }

    export enum Init_Ctrl_Sensor_type {
        //% block="Lantern"
        Lantern = 0x01,
        //% block="buzzer"
        buzzer = 0x02,
    }

    export enum Ctrl_Sensor_type {
        //% block="buzzer"
        buzzer = 0x01,
    }

    /**
     * Initialize the sensor
     */
    //% weight=99 blockId=SensorInit block="Initialize %port | %sensor"
    export function SensorInit(port: hicbit_Port,sensor:Sensor_type):void{
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(8);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x05;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xC0;                      //CMD
        buf[5] = sensor;
        buf[6] = port;
        for (let i = 0; i < 7; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[7] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
    }

    /**
     * Get the value of a sensor on a port
     */
    //% weight=98 blockGap=50 blockId=GetSensorValue block="Get %port | %sensor "
    export function GetSensorValue(port: hicbit_Port,sensor:Sensor_type): number {
        let Check_Digit: number = 0;
        let sersor_value: number = 0;
        let buf = pins.createBuffer(8);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x05;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xC1;                      //CMD
        buf[5] = sensor;
        buf[6] = port;
        for (let i = 0; i < 7; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[7] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(1000);

        switch (port)    //Port_num
        {
            case 1:
                sersor_value = hicbit_control.Port_A[sensor];
                break;
            case 2:
                sersor_value = hicbit_control.Port_B[sensor];
                break;
            case 3:
                sersor_value = hicbit_control.Port_C[sensor];
                break;
            case 4:
                sersor_value = hicbit_control.Port_D[sensor];
                break;
        }

        hicbit_control.arrayInit();
        return sersor_value;
    }

    /**
     * Initialize the Ctrl sensor
     */
    //% weight=97 blockId=CtrlSensorInit block="Initialize %port | %Ctrl_sensor"
    export function CtrlSensorInit(port: hicbit_Port,Ctrl_sensor:Init_Ctrl_Sensor_type):void{
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(8);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x05;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xE0;                      //CMD
        buf[5] = Ctrl_sensor;
        buf[6] = port;
        for (let i = 0; i < 7; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[7] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
    }

    /**
     * Set the Ctrl sensor
     */
    //% weight=96 blockId=SetCtrlSensor block="Set |%port |%Ctrl_sensor |%num"
    export function SetCtrlSensor(port: hicbit_Port,Ctrl_sensor: Ctrl_Sensor_type,num: number):void{
        let Check_Digit: number = 0;
        let num1: number = 0;
        let num2: number = 0;
        let num3: number = 0;
        let buf = pins.createBuffer(11);

        num1 = num;

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x08;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xE1;                      //CMD
        buf[5] = Ctrl_sensor + 1;
        buf[6] = num1;
        buf[7] = num2;
        buf[8] = num3;
        buf[9] = port;
        for (let i = 0; i < 10; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[10] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
    }

    /**
     * Set the Lantern
     */
    //% weight=95 blockId=SetRGBLantern block="Set |%port |red %red|and|green %green|and|blue %blue|"
    //% inlineInputMode=inline
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    export function SetRGBLantern(port: hicbit_Port, red: number, green: number, blue: number):void{
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(11);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x08;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xE1;                      //CMD
        buf[5] = 0x01;
        buf[6] = red;
        buf[7] = green;
        buf[8] = blue;
        buf[9] = port;
        for (let i = 0; i < 10; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[10] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
    }

}

/*
 Display package
*/
//% weight=5 icon="\uf108" color=#6E8B3D
namespace Display {

    export let NEW_LINE = "\r\n";

    export enum Linenum {
        //% block="first_line"
        first_line = 0x01,
        //% block="second_line"
        second_line = 0x02,
        //% block="Third_line"
        Third_line = 0x03,
        //% block="Fourth_line"
        Fourth_line = 0x04,
        //% block="Fifth_line"
        Fifth_line = 0x05,
        
    }

    export enum Sensornum {
        //% block="Sound_sensor"
        Sound_sensor = 0x01,
        //% block="Tracking_sensor"
        Tracking_sensor = 0x02,
        //% block="Accelerating_gyroscope"
        Accelerating_gyroscope = 0x03,
        //% block="Color_sensor"
        Color_sensor = 0x04,
    }
    
    /**
        * Display Init
        */
    //% weight=100 blockId=DisplayInit block="Display Init"
    export function DisplayInit(): void {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(7);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x04;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xB0;                      //CMD
        buf[5] = 0x00;
        for (let i = 0; i < 6; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[6] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
       
    }

    /**
        * Any value displayed on the screen
        */
    //% weight=99 blockId=setDisplay2 block="Display %line |text: %text "
    export function setDisplay2(line: Linenum, text: string): void {
        let num: number = 1;
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(6);
        let buf1 = pins.createBuffer(1);
        switch (line) {
            case Linenum.first_line:
                num = 1;
                break;
            case Linenum.second_line:
                num = 2;
                break;
            case Linenum.Third_line:
                num = 3;
                break;
            case Linenum.Fourth_line:
                num = 4;
                break;
            case Linenum.Fifth_line:
                num = 5;
                break;
        }
        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x04 + text.length;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xB1;                      //CMD
        buf[5] = num;                       //行数
        serial.writeBuffer(buf);
        serial.writeString(text);           //内容
        for (let i = 0; i < buf.length; i++)
            Check_Digit = Check_Digit + buf[i];
        for (let i = 0; i < text.length; i++)
            Check_Digit = Check_Digit + text.charCodeAt(i);
        buf1[0] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf1);
        //serial.writeString(NEW_LINE);

        basic.pause(500);
    }



    /**
        * Display clear
        */
    //% weight=98 blockId=Clearscreen block="Clear screen"
    export function Clearscreen(): void {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(7);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x04;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xB2;                      //CMD
        buf[5] = 0x00;
        for (let i = 0; i < 6; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[6] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);
       
        basic.pause(500);
    }


    /**
        * Display exit
        */
    //% weight=97 blockId=exitscreen block="Display exit screen"
    export function exitscreen(): void {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(7);

        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x04;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xB3;                      //CMD
        buf[5] = 0x00;
        for (let i = 0; i < 6; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[6] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);

        basic.pause(500);
       
    }


    /**
        * The screen displays the value of the sensor
        */
    //% weight=96 blockId=DisplaysersorValue block="Display %port | %sensor "
    export function DisplaysersorValue(port: Sensor.hicbit_Port ,sensor:Sensor.Sensor_type): void {
        let Check_Digit: number = 0;
        let buf = pins.createBuffer(8);
        
        buf[0] = 0xFE;
        buf[1] = 0xFE;
        buf[2] = 0x05;        //长度
        buf[3] = hicbit_control.getsncode();//sn码
        buf[4] = 0xB4;                      //CMD
        buf[5] = sensor;                       //类型
        buf[6] = port;
        for (let i = 0; i < 7; i++)
            Check_Digit = Check_Digit + buf[i];
        buf[7] = Check_Digit & 0xFF;       //校验
        serial.writeBuffer(buf);
        //serial.writeString(NEW_LINE);

        basic.pause(500);
    }
}

