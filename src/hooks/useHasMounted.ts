// Hydration is happens when the content that loads in the server side and in the client side is not same too solve this we created the hooks folder
//https://www.joshwcomeau.com/react/the-perils-of-rehydration/

import { useEffect, useState } from "react";

function useHasMounted() {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	return hasMounted;
}

export default useHasMounted;
