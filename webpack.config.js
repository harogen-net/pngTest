const path = require('path');
const webpack = require('webpack');
module.exports = {
	mode:"development",
	
    // ���W���[���o���h����s���N�_�ƂȂ�t�@�C���̎w��
    // �w��ł���l�Ƃ��ẮA�t�@�C�����̕������A�������ׂ��z���I�u�W�F�N�g
    // ���L�̓I�u�W�F�N�g�Ƃ��Ďw�肵���� 
    entry: {
        "js/index": './src/index.ts'
    },  
    output: {
        // ���W���[���o���h����s�������ʂ�o�͂���ꏊ��t�@�C�����̎w��
        // "__dirname"�͂��̃t�@�C�������݂���f�B���N�g����\��node.js�Œ�`�ς݂̒萔
        path: path.join(__dirname,'dist'),
        filename: '[name].js'  // [name]��entry�ŋL�q�������O(���̗�ł�bundle�j������
    },
    // ���W���[���Ƃ��Ĉ��������t�@�C���̊g���q��w�肷��
    // �Ⴆ�΁uimport Foo from './foo'�v�Ƃ����L�q�ɑ΂���"foo.ts"�Ƃ������O�̃t�@�C����W���[���Ƃ��ĒT��
    // �f�t�H���g��['.js', '.json']
    resolve: {
        extensions:['.ts','.js']
    },
    devServer: {
        // webpack-dev-server�̌��J�t�H���_
        contentBase: path.join(__dirname,'dist')
    },
    // ���W���[���ɓK�p���郋�[���̐ݒ�i�����ł̓��[�_�[�̐ݒ��s�����������j
    module: {
        rules: [
            {
                // �g���q��.ts�ŏI���t�@�C���ɑ΂��āATypeScript�R���p�C����K�p����
                test:/\.ts$/,
                use:'ts-loader'
            }
        ]
    },
    plugins: [
    	new webpack.ProvidePlugin({
    		$:'jquery',
    		jQuery:"jquery"
    	})
    ]
}