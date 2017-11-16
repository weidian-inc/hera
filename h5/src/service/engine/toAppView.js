import utils from './utils';

class toAppView{
    constructor() {
    }
    static emit (data, webviewId) {
        utils.publish("appDataChange", {
            data: {
                data: data
            }
        },[webviewId]);
    }

}
export default toAppView;
