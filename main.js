const fs = require('fs').promises; // Usando fs.promises para promessas
const path = require('path');
const { app, dialog } = require('electron');
const Jimp = require('jimp');

// Função para converter imagens PNG para WebP
async function convertToWebP(inputPath, outputPath, quality) {
    try {
        const image = await Jimp.read(inputPath);
        const webpPath = outputPath.replace(/\.png$/, '.webp');

        await image.quality(quality).write(webpPath);

        console.log(`Conversão concluída: ${inputPath} -> ${webpPath}`);
    } catch (error) {
        console.error(`Erro ao converter ${inputPath} para WebP: ${error.message}`);
    }
}

//Remove os arquivos webp se o tamanho for maior que o png
async function removeWebP(pngFile, webpFile) {

    try {
        //Verfica o tamanho dos arquivos
        const pngStats = await fs.stat(pngFile);
        const webpStats = await fs.stat(webpFile);

        //Se o tamanho do webp for maior que o png, remove o webp
        if(webpStats.size > pngStats.size){
            await fs.unlink(webpFile);
            console.log(`Arquivo removido: ${webpFile}`);
        }
    }catch (error) {
        console.error(`Erro ao remover ${webpFile}: ${error.message}`);
    }
}

// Inicializa o aplicativo Electron
app.on('ready', () => {
    // Abre a caixa de diálogo para selecionar o diretório
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const selectedDirectory = result.filePaths[0];

            // Diretório de entrada e saída
            const inputDirectory = selectedDirectory;
            const outputDirectory = selectedDirectory; // Pode ser alterado se desejar um diretório de saída diferente
            const quality = 60; // Qualidade do WebP (de 0 a 100)

            // Lê todos os arquivos PNG no diretório de entrada
            fs.readdir(inputDirectory, async (err, files) => {
                if (err) {
                    console.error(`Erro ao ler diretório: ${err.message}`);
                    return;
                }

                // Filtra apenas os arquivos PNG
                const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');

                // Converte cada arquivo PNG para WebP
                for (const pngFile of pngFiles) {
                    const inputPath = path.join(inputDirectory, pngFile);
                    const outputFileName = pngFile.replace(/\.png$/, '.webp');
                    const outputPath = path.join(outputDirectory, outputFileName);

                    await convertToWebP(inputPath, outputPath, quality);
                    await removeWebP(inputPath, outputPath);
                }

                // Fecha o aplicativo após a conclusão
                app.quit();
            });
        } else {
            console.log('Nenhum diretório selecionado. O aplicativo será encerrado.');
            app.quit();
        }
    });
});
