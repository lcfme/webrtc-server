declare type Signal<T> = {
    cmd: string;
    args: Array<T>;
};
declare type RTCDescription = {
    type: string;
    sdp: string;
    [k: string]: any;
};
