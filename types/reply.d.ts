/**
 * Return type for various [Sink](#sink) functions. Indicates whether or not the sink
 * desires more input from its source. See [`Bacon.fromBinder`](#frombinder) for example.
 */
export declare type Reply = "<no-more>" | any;
/**
 * Reply for "more data, please".
 */
export declare const more: Reply;
/**
 * Reply for "no more data, please".
 */
export declare const noMore: Reply;
