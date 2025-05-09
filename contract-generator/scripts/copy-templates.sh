#!/bin/bash

# Script to copy document templates from the contracts directory to the public/templates directory

# Create destination directory if it doesn't exist
mkdir -p contract-generator/public/templates

# Copy the existing templates
cp -f contracts/smlouva_o_dilo_template.docx contract-generator/public/templates/
cp -f contracts/kupni_smlouva_template.docx contract-generator/public/templates/
cp -f contracts/dohoda_o_provedeni_prace_template.docx contract-generator/public/templates/

# Copy the new templates
cp -f contracts/231127_Ingredi\ Europa\ HOLDING_PoA_Zalozeni_Statutar_Jan\ Urban_cz.docx contract-generator/public/templates/poa_zalozeni_statutar_template.docx
cp -f contracts/231127_Ingredi\ Holding\ a.s._Affidavit_SR_Jan\ Urban_cz.docx contract-generator/public/templates/affidavit_sr_template.docx
cp -f contracts/231127_Ingredi_HoldCo_Stanovy_cz.docx contract-generator/public/templates/stanovy_template.docx
cp -f contracts/231128_Ingredi_HoldCo_Affidavit_Statutar_cz.docx contract-generator/public/templates/affidavit_statutar_template.docx
cp -f contracts/231128_Ingredi_HoldCo_PoA_RT_cz.docx contract-generator/public/templates/poa_rt_template.docx
cp -f contracts/231128_Ingredi_HoldCo_PoA_Shareholder_cz.docx contract-generator/public/templates/poa_shareholder_template.docx
cp -f contracts/231128_Ingredi_HoldCo_PoA_Statutar_cz.docx contract-generator/public/templates/poa_statutar_template.docx
cp -f contracts/231128_Ingredi_HoldCo_Rozhodnuti_UmisteniSidla_cz.docx contract-generator/public/templates/rozhodnuti_umisteni_sidla_template.docx
cp -f contracts/231128_Ingredi_HoldCo_Souhlas_UmisteniSidla_cz.docx contract-generator/public/templates/souhlas_umisteni_sidla_template.docx
cp -f contracts/231220_Ingredi_Prohlaseni_SpravceVkladu_cz.docx contract-generator/public/templates/prohlaseni_spravce_vkladu_template.docx

echo "Templates copied successfully!"
