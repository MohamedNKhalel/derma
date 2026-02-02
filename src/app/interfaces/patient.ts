import { RecordFile } from "./record-file";

export interface Patient {
    id:string;
    name:string,
    gender:string,
    date_of_birth:string,
    doctor_uid:string,
    phone:string,
    email:string,
    scans:RecordFile,
    rate:{
        bloodPressureRate:number,
        bloodSugarRate:number,
        temperature:number
    }
}
