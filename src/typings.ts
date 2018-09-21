type Signal<T> = {
    cmd: string;
    args: Array<T>;
};

type RTCDescription = {
    type: string;
    sdp: string;
    [k: string]: any;
};
