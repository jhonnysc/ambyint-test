const regex = new RegExp(/\d+/g)

export const getUrlId = (url: string) => {
    const result = url.match(regex)
    if (result) return result[0]
    return null
}