document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evalForm');
    const radiosModalidade = document.querySelectorAll('input[name="modalidade"]');
    const blockMediadores = document.getElementById('blockMediadores');
    const rowPrintMediadores = document.getElementById('rowPrintMediadores');
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');

    // Configura o step = 1 e os limites de 0 a 10 em todos os campos de nota
    const scoreInputs = document.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
        input.setAttribute('type', 'number');
        input.setAttribute('min', '0');
        input.setAttribute('max', '10');
        input.setAttribute('step', '1');

        // Impede digitação de notas maiores que 10 ou menores que 0
        input.addEventListener('input', () => {
            if (parseFloat(input.value) > 10) input.value = 10;
            if (parseFloat(input.value) < 0) input.value = 0;
            calculateScores();
        });
    });

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

    // Verifica se todos os campos visíveis possuem nota antes de gerar o PDF
    function validateAllScoresFilled(isAuto) {
        const requiredInputs = document.querySelectorAll('.score-input');
        for (let input of requiredInputs) {
            // Se for avaliação da chefia e o campo for de mediadores, ignora
            if (!isAuto && input.classList.contains('input-mediadores')) {
                continue;
            }
            if (input.value === '' || isNaN(parseFloat(input.value))) {
                return false;
            }
        }
        return true;
    }

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
                const inputVal = item.querySelector('input').value;
                const trItem = document.createElement('tr');
                trItem.innerHTML = `
                    <td class="cell-desc">${questionText}</td>
                    <td class="cell-nota">${inputVal !== '' ? parseInt(inputVal, 10) : '-'}</td>
                `;
                tbody.appendChild(trItem);
            });
        });
    }

   function prepareReportData() {
    const scores = calculateScores();
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    const nomeServidor = document.getElementById('nomeServidor').value || 'Servidor(a)';
    const nomeChefia = document.getElementById('nomeChefia').value || 'Chefia Imediata';

    // Preenchimento dos dados de identificação
    document.getElementById('pModalidadeBadge').innerText = scores.isAuto ? 'AUTOAVALIAÇÃO' : 'AVALIAÇÃO DA CHEFIA IMEDIATA';
    document.getElementById('pNomeServidor').innerText = nomeServidor;
    document.getElementById('pSiape').innerText = document.getElementById('siape').value || 'Não Informado';
    document.getElementById('pCargoServidor').innerText = document.getElementById('cargoServidor').value || 'Não Informado';
    document.getElementById('pPeriodo').innerText = document.getElementById('periodoAvaliacao').value || 'Não Informado';
    document.getElementById('pOrgaoDestino').innerText = document.getElementById('orgaoDestino').value || 'Não Informado';
    document.getElementById('pNomeChefia').innerText = nomeChefia;
    document.getElementById('pCargoChefia').innerText = document.getElementById('cargoChefia').value || 'Não Informado';

    generateDetailedNotesTable(scores.isAuto);

    // Preenchimento das médias e pontuações
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

    // LÓGICA DE ASSINATURA ÚNICA
    const sigContainer = document.getElementById('pSignaturesContainer');
    
    if (scores.isAuto) {
        // Exibe apenas a assinatura do Servidor
        sigContainer.innerHTML = `
            <div class="signature-box" style="margin: 0 auto;">
                <div class="line"></div>
                <p><strong>${nomeServidor}</strong></p>
                <p>Servidor(a) Avaliado(a)</p>
                <p>Data: ${dataHoje}</p>
            </div>
        `;
    } else {
        // Exibe apenas a assinatura da Chefia Imediata
        sigContainer.innerHTML = `
            <div class="signature-box" style="margin: 0 auto;">
                <div class="line"></div>
                <p><strong>${nomeChefia}</strong></p>
                <p>Chefia Imediata (Avaliador)</p>
                <p>Data: ${dataHoje}</p>
            </div>
        `;
    }

    return scores;
}

    // Função para sanitizar e formatar o nome no arquivo
    function formatFileName(name) {
        return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-0]/g, '_');
    }

    btnDownloadPDF.addEventListener('click', async () => {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';

        // 1. Validação dos campos de identificação obrigatórios do formulário
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 2. Validação se TODAS as notas foram atribuídas
        if (!validateAllScoresFilled(isAuto)) {
            alert('Por favor, preencha todas as notas da avaliação antes de gerar o relatório PDF.');
            return;
        }

        prepareReportData();

        const printArea = document.getElementById('printArea');
        const nomeServidor = document.getElementById('nomeServidor').value || 'servidor';
        const nomeChefia = document.getElementById('nomeChefia').value || 'chefia';

        // Definição do nome do arquivo PDF impresso
        let filenamePDF = '';
        if (isAuto) {
            filenamePDF = `autoavaliacao_${formatFileName(nomeServidor)}.pdf`;
        } else {
            filenamePDF = `avaliacao_${formatFileName(nomeChefia)}_${formatFileName(nomeServidor)}.pdf`;
        }

        // Clonagem para geração sem falhas
        const clone = printArea.cloneNode(true);
        clone.id = 'pdfTempContainer';
        clone.style.display = 'block';
        clone.style.width = '700px';
        clone.style.margin = '0 auto';
        clone.style.backgroundColor = '#ffffff';

        document.body.appendChild(clone);

        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     filenamePDF,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['css', 'legacy'] }
        };

        try {
            await html2pdf().set(opt).from(clone).save();
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
        } finally {
            if (document.getElementById('pdfTempContainer')) {
                document.body.removeChild(clone);
            }
        }
    });

    updateModalidadeUI();
});
