/**
 * Return type for various [Sink](#sink) functions. Indicates whether or not the sink
 * desires more input from its source. See [`Bacon.fromBinder`](#frombinder) for example.
 */
export type Reply = "<no-more>" | undefined | void

/**
 * Reply for "more data, please".
 */
export const more: Reply = undefined
/**
 * Reply for "no more data, please".
 */
export const noMore: Reply = "<no-more>"
