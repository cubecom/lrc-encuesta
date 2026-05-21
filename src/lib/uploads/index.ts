export const fetchSignedUrls = async (keys: string[], publicUrl?: boolean) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_URL_UPLOAD}${publicUrl ? '/public' : ''}/signed-urls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keys }),
        })
    
        const data = await res.json()
        return {ok: true, data}
    } catch (error) {
        console.log(error)
        return { ok: false, data: [] }
    }
}