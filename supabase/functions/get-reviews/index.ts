import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
    const { placeId } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=reviews,rating,userRatingCount&key=${apiKey}&languageCode=es`;

    const response = await fetch(url);
    const data = await response.json();

    console.log(`[OBS] Reseñas servidas para ${placeId}`);

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
});
