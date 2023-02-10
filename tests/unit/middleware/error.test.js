let error = require("../../../middleware/error");

describe("Error middleware.", ()=>{
    it("Should execute the status method with 500 as the argument", ()=>{
        let res = {};
        let mockRet = {send: jest.fn()};
        res.status = jest.fn().mockReturnValue(mockRet);

        error({message: "Testing errors"}, {}, res, {});

        expect(res.status).toHaveBeenCalled();
        expect(res.status.mock.calls[0][0]).toBe(500);

        expect(mockRet.send).toHaveBeenCalled();
        expect(mockRet.send.mock.calls[0][0]).toContain("Error");
    });
});