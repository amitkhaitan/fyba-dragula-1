import { CurrentPeriodSlot } from './workbench.model';

export interface RootModel{
    CurrentPeriodSlot: CurrentPeriodSlot;
    DeletedTimeSlot: Array<DeletedTimeSlot>;
    FYBADataFromBackEnd:FYBADataFromBackEnd;
    MiniDatabase:Array<CurrentPeriodSlot>;
}


export interface DeletedTimeSlot{

}

export interface FYBADataFromBackEnd{
    GameScheduleId:number;
    LoginUserId:number;
    Period:number;
    SeasonId:number;
}

