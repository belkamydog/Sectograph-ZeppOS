
import { deleteEvent } from '../utils/services/EventService';


describe ('delete test', ()=>{

    let loadEventsMock = jest.fn()
    global.loadEvents = loadEventsMock
    loadEventsMock.mockImplementation(() => {
        return 
        [
            {id: 1, description: 'test1', start: new Date(), end: new Date() + 360000, repeat: 'never', color: '0x000000'},
            {id: 2, description: 'test2', start: new Date() + 360000, end: new Date()+ 360000*  2, repeat: 'never', color: '0x000000'},
        ]
    });

    let checkEventFieldsMock = jest.fn()
    global.checkEventFields = checkEventFieldsMock
    checkEventFieldsMock.mockImplementation((ev) =>{
        if (ev.id == 2) return true
        else return false
    })

    let saveEventsMock = jest.fn()
    global.saveEvents = saveEventsMock

    let uploadActualEventsMock = jest.fn()
    global.uploadActualEvents = uploadActualEventsMock

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("deleteEvent", ()=> {
        const result = deleteEvent(2)
        expect(result).toBe([{id: 1, description: 'test1', start: new Date(), end: new Date() + 360000, repeat: 'never', color: '0x000000'},]);
    })
})



