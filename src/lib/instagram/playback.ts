let current: HTMLVideoElement | null = null;

/** Só um vídeo toca por vez na tela: dar play em um pausa o anterior. */
export function playExclusive(video: HTMLVideoElement): Promise<void> {
	if (current && current !== video) current.pause();
	current = video;
	return video.play();
}
