import { CurrentPeriodSlot, AllSlotBox, allSlots } from './workbench.model';


export interface RootModel{
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

