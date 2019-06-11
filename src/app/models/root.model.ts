import { CurrentPeriodSlot, AllSlotBox, allSlots } from './workbench.model';

export interface BlackOuts{
    Date:string;
    StartTime:string;
    StopTime:string;
    FacilityId:number;
    FacilityName:string;
}

export interface RootModel{
    BlackOuts: Array<BlackOuts>
    CurrentPeriodSlot: CurrentPeriodSlot;
    DeletedTimeSlot: Array<AllSlotBox>;
    FYBADataFromBackEnd:FYBADataFromBackEnd;
    MiniDatabase:Array<MiniDatabase>;
    //MiniDatabase:Array<CurrentPeriodSlot>;
}

export interface FYBADataFromBackEnd{
    GameScheduleId:number;
    LoginUserId:number;
    Period:number;
    SeasonId:number;
}

export interface MiniDatabase{
    Slots:Array<CurrentPeriodSlot>
}

export interface Slots{
    FutureData: Array<CurrentPeriodSlot>
}

