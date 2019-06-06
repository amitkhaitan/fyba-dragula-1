import { CurrentPeriodSlot, AllSlotBox } from './workbench.model';


export interface RootModel{
    CurrentPeriodSlot: CurrentPeriodSlot;
    DeletedTimeSlot: Array<AllSlotBox>;
    FYBADataFromBackEnd:FYBADataFromBackEnd;
    MiniDatabase:Array<CurrentPeriodSlot>;
}

export interface FYBADataFromBackEnd{
    GameScheduleId:number;
    LoginUserId:number;
    Period:number;
    SeasonId:number;
}

