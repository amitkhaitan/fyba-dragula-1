
export class CurrentPeriodSlot{
    Timing: Timing;
    Period:number;
    TimeInterval:number;
    allSlots: Array<allSlots>;
    FreeGames: Array<FreeGames>;
    ResourceLine: Array<ResourceLine>;
    TimeSlot: Array<TimeSlot>;
    TravelMatrix: Array<TravelMatrix>;
    DeletedTimeSlot: Array<AllSlotBox>;
}

export class Timing{
    Heading:string;
    
    TimeValue: Array<TimeValue>;

    constructor(){
        this.Heading = '';
    }
}

export class TimeValue{
    TimeValue: string;
    TimeGroup: string;

    constructor(){
        this.TimeValue = '';
        this.TimeGroup = '';
    }
}

export class allSlots{
    Heading: string;
    FacilityCurrentPeriodDate:string;
    AllSlotBox: Array<AllSlotBox>;

    constructor(){
        this.Heading = '';
    }

}

export class AllSlotBox{
    IsGameBox:boolean;
    IsBlankBox:boolean;
    Height:string;
    Top:string;
    LocationId:number;
    AllGameBox: Array<AllGameBox>;
    BackgroundColor:string;
    Slot_1: string;
    SlotId:string;
    SlotDivId:string;
    SeriesId:number;
    StartTime:string;
    EndTime:string;
    Location:string;
    Duration:number;
    SlotColor:string;
    TimeSlotDate:string;
    TimeSlotId:number;

    constructor(){
        this.IsGameBox = null;
        this.IsBlankBox = null;
        this.Height = '';
        this.Top = '';
        this.Slot_1 = '';
        this.SlotId = '';
        this.StartTime = '';
        this.EndTime = '';
        this.Location = '';
        this.Duration = null;
        this.SlotColor = '';
        this.TimeSlotDate = '';
        this.TimeSlotId = null;
        this.SlotDivId = '';
    }
}

export class AllGameBox{
    TimeGroup: string;
    AllBox: Array<AllBox>;
    
    constructor(){
        this.TimeGroup = '';        
    }
}

export class AllBox {
    BackgroundColor:string;
    BoxTop: string;
    BoxHeight: string;
    BoxColor: string;
    BoxValue: string;
    TimeGroup: string;
    GameDivId: string;
    StartTime: string;
    EndTime: string;
    Duration: number;
    Division: string;
    GameMatchupId:number;
    GameVolunteerList:Array<GameVolunteerList>;

    constructor(){
        this.BoxTop = '';
        this.BoxHeight = '';
        this.BoxColor = '';
        this.BoxValue = '';
        this.TimeGroup = '';
        this.GameDivId = '';
        this.StartTime = '';
        this.EndTime = '';
        this.Duration = null;
        this.Division = '';
    }
}

export class GameVolunteerList{
    VolunteerSeasonalId:string;
    constructor(){
        this.VolunteerSeasonalId = null;
    }
}

export class FreeGames{
    Name:string;
    GameDivId:string;
    GameMatchupId:number;
    GameVolunteerList:Array<GameVolunteerList>;
    Division:string;

    constructor(){
        this.Name = '';
        this.GameDivId = '';
        this.Division = '';
    }
}


export class ResourceLine{
    StartPointDivId:string;
    EndPointDivId:string;
    LineDivId:string;

    constructor(){
        this.StartPointDivId = '';
        this.EndPointDivId = '';
        this.LineDivId 
    }
}

export class TimeSlot{
    TimeText: string;
    TimeBoxHeight:string;
    TimeDivId:string;
    TimeValueInMinute:string;
    SlotColor:string;

    constructor(){
        this.TimeText = '';
        this.TimeBoxHeight = '';
        this.TimeDivId = '';
        this.TimeValueInMinute = '';
        this.SlotColor = '';
    }
}

export class TravelMatrix{
    Duration: number;
    FromFacilityId:number;
    ToFacilityId:number;

    constructor(){
        this.Duration = null;
        this.FromFacilityId = null;
        this.ToFacilityId = null;

    }
}