document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evalForm');
    const radiosModalidade = document.querySelectorAll('input[name="modalidade"]');
    const blockMediadores = document.getElementById('blockMediadores');
    const rowPrintMediadores = document.getElementById('rowPrintMediadores');
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');

    function updateModalidadeUI() {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';
        if (isAuto) {
            blockMediadores.style.display = 'block';
            if (rowPrintMediadores) rowPrintMediadores.style.display = 'table-row';
            document.getElementById('lblScoreMax').innerText = '(Máximo: 4.25)';
        } else {
            blockMediadores.style.display = 'none';
            if (rowPrintMediadores) rowPrintMediadores.style.display = 'none';
            document.getElementById('lblScoreMax').innerText = '(Máximo: 5.75)';
        }
        calculateScores();
    }

    radiosModalidade.forEach(radio => radio.addEventListener('change', updateModalidadeUI));

    function getAverage(className) {
        const inputs = Array.from(document.querySelectorAll(`.${className}`));
        const validInputs = inputs.filter(i => i.value !== '' && !isNaN(parseFloat(i.value)));
        if (validInputs.length === 0) return 0;
        const sum = validInputs.reduce((acc, curr) => acc + parseFloat(curr.value), 0);
        return sum / validInputs.length;
    }

    function calculateScores() {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';

        const avgConhecimentos = getAverage('input-conhecimentos');
        const avgHabilidades = getAverage('input-habilidades');
        const avgMetas = getAverage('input-metas');
        const avgComportamentos = getAverage('input-comportamentos');

        const factorConhecimentos = isAuto ? 0.10 : 0.15;
        const factorHabilidades = isAuto ? 0.10 : 0.15;
        const factorMetas = isAuto ? 0.10 : 0.15;
        const factorComportamentos = 0.125;

        const pondConhecimentos = avgConhecimentos * factorConhecimentos;
        const pondHabilidades = avgHabilidades * factorHabilidades;
        const pondMetas = avgMetas * factorMetas;
        const pondComportamentos = avgComportamentos * factorComportamentos;

        const totalPonderado = pondConhecimentos + pondHabilidades + pondMetas + pondComportamentos;

        document.getElementById('lblScoreConhecimentos').innerText = `${pondConhecimentos.toFixed(2)} pts (Média: ${avgConhecimentos.toFixed(1)})`;
        document.getElementById('lblScoreHabilidades').innerText = `${pondHabilidades.toFixed(2)} pts (Média: ${avgHabilidades.toFixed(1)})`;
        document.getElementById('lblScoreMetas').innerText = `${pondMetas.toFixed(2)} pts (Média: ${avgMetas.toFixed(1)})`;
        document.getElementById('lblScoreComportamentos').innerText = `${pondComportamentos.toFixed(2)} pts (Média: ${avgComportamentos.toFixed(1)})`;
        document.getElementById('lblScoreTotal').innerText = totalPonderado.toFixed(2);

        return {
            isAuto, avgConhecimentos, avgHabilidades, avgMetas, avgComportamentos,
            pondConhecimentos, pondHabilidades, pondMetas, pondComportamentos, totalPonderado
        };
    }

    document.querySelectorAll('.score-input').forEach(input => {
        input.addEventListener('input', calculateScores);
    });

    function generateDetailedNotesTable(isAuto) {
        const tbody = document.getElementById('pTableDetailedNotes');
        tbody.innerHTML = '';

        const dimBlocks = document.querySelectorAll('.dimensao-block');
        dimBlocks.forEach(block => {
            if (!isAuto && block.id === 'blockMediadores') return;

            const title = block.querySelector('h4').innerText;
            const trTitle = document.createElement('tr');
            trTitle.innerHTML = `<td colspan="2" class="sub-dim-title">${title}</td>`;
            tbody.appendChild(trTitle);

            const items = block.querySelectorAll('.question-item');
            items.forEach(item => {
                const questionText = item.querySelector('label').innerText;
                const val = item.querySelector('input').value;
                const trItem = document.createElement('tr');
                trItem.innerHTML = `
                    <td>${questionText}</td>
                    <td style="text-align: center; font-weight: bold;">${val !== '' ? val : '-'}</td>
                `;
                tbody.appendChild(trItem);
            });
        });
    }

    function prepareReportData() {
        const scores = calculateScores();

        document.getElementById('pModalidadeBadge').innerText = scores.isAuto ? 'AUTOAVALIAÇÃO' : 'AVALIAÇÃO DA CHEFIA IMEDIATA';
        document.getElementById('pNomeServidor').innerText = document.getElementById('nomeServidor').value || 'Não Informado';
        document.getElementById('pSiape').innerText = document.getElementById('siape').value || 'Não Informado';
        document.getElementById('pCargoServidor').innerText = document.getElementById('cargoServidor').value || 'Não Informado';
        document.getElementById('pPeriodo').innerText = document.getElementById('periodoAvaliacao').value || 'Não Informado';
        document.getElementById('pOrgaoDestino').innerText = document.getElementById('orgaoDestino').value || 'Não Informado';
        document.getElementById('pNomeChefia').innerText = document.getElementById('nomeChefia').value || 'Não Informado';
        document.getElementById('pCargoChefia').innerText = document.getElementById('cargoChefia').value || 'Não Informado';

        generateDetailedNotesTable(scores.isAuto);

        document.getElementById('pMediaConhecimentos').innerText = scores.avgConhecimentos.toFixed(1);
        document.getElementById('pPondConhecimentos').innerText = scores.pondConhecimentos.toFixed(2);

        document.getElementById('pMediaHabilidades').innerText = scores.avgHabilidades.toFixed(1);
        document.getElementById('pPondHabilidades').innerText = scores.pondHabilidades.toFixed(2);

        document.getElementById('pMediaMetas').innerText = scores.avgMetas.toFixed(1);
        document.getElementById('pPondMetas').innerText = scores.pondMetas.toFixed(2);

        document.getElementById('pMediaComportamentos').innerText = scores.avgComportamentos.toFixed(1);
        document.getElementById('pPondComportamentos').innerText = scores.pondComportamentos.toFixed(2);

        if (scores.isAuto && document.getElementById('pMediaMediadores')) {
            document.getElementById('pMediaMediadores').innerText = getAverage('input-mediadores').toFixed(1);
        }

        document.getElementById('pTotalObtido').innerText = `${scores.totalPonderado.toFixed(2)} / ${scores.isAuto ? '4.25' : '5.75'}`;
        document.getElementById('pObservacoes').innerText = document.getElementById('observacoes').value || 'Sem observações.';

        document.getElementById('pSigServidor').innerText = document.getElementById('nomeServidor').value || 'Assinatura do Servidor';
        document.getElementById('pSigChefia').innerText = document.getElementById('nomeChefia').value || 'Assinatura da Chefia';

        return scores;
    }

    btnDownloadPDF.addEventListener('click', async () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        prepareReportData();

        const pdfWrapper = document.getElementById('pdfRenderWrapper');
        const element = document.getElementById('printArea');
        const siapeVal = document.getElementById('siape').value || 'servidor';

        // 1. Torna a área visível temporariamente
        pdfWrapper.classList.add('rendering-pdf');

        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     `avaliacao_uffs_${siapeVal}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
        } finally {
            // 2. Oculta novamente após a conclusão
            pdfWrapper.classList.remove('rendering-pdf');
        }
    });

    updateModalidadeUI();
});
